import pytest
from main import completion


def test_normal():
    assert completion(2, 5) == 0.4


def test_empty():
    assert completion(0, 0) == 0


def test_invalid():
    with pytest.raises(ValueError):
        completion(3, 2)
