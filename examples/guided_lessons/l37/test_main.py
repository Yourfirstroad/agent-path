import unittest
from main import completion


class Tests(unittest.TestCase):
    def test_normal(self):
        self.assertEqual(completion(2, 5), 0.4)

    def test_empty(self):
        self.assertEqual(completion(0, 0), 0)

    def test_invalid(self):
        with self.assertRaises(ValueError):
            completion(3, 2)


if __name__ == "__main__":
    unittest.main()
