import io
import unittest
from openpyxl import Workbook
from sync_m365 import parse_workbook, serialise


class WorkbookTests(unittest.TestCase):
    def test_dates(self):
        self.assertEqual(serialise('25/10/2026', 'Due'), '2026-10-25')
        with self.assertRaises(ValueError):
            serialise('31/02/2026', 'Due')

    def test_mapping_and_duplicate_ids(self):
        book = Workbook()
        sheet = book.active
        sheet.title = 'Alerts'
        sheet.append(['ID', 'Due'])
        sheet.append(['A1', '25/10/2026'])
        source = {'id': 'test', 'sheets': [{'name': 'Alerts', 'dataset': 'alerts',
                  'idField': 'AlertID', 'columns': {'AlertID': 'ID', 'Due': 'Due'}}]}
        stream = io.BytesIO()
        book.save(stream)
        result = parse_workbook(stream.getvalue(), source)
        self.assertEqual(result[0]['data']['Due'], '2026-10-25')
        sheet.append(['A1', '26/10/2026'])
        stream = io.BytesIO()
        book.save(stream)
        with self.assertRaises(ValueError):
            parse_workbook(stream.getvalue(), source)
        book.close()


if __name__ == '__main__':
    unittest.main()
