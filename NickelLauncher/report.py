class Report:
    """
    A basic class to report the progress of execution of code.
    This is probably an antipattern, but it works for me.
    """
    PROGRESS = 0
    ERROR = 1

    def __init__(self, type_: int, text: str, percent: int = -1):
        self.type = type_
        self.percent = percent

        self._text = text

    @property
    def text(self) -> str:
        return self._text if self.type == self.ERROR else self._text + '...'
