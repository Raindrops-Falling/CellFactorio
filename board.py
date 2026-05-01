from enum import Enum

BOARD_WIDTH = 400
BOARD_HEIGHT = 300


class TileType(Enum):
    VOID = 0
    WATER = 1
    SAND = 2
    GRASS = 3
    STONE = 4
    SNOW = 5


class Tile:
    type = TileType.VOID
    temp = 15  # in celsius
    elevation = 0  # relative to sea level


class Board:
    tiles = []

    def __init__(self):
        for i in range(0, BOARD_WIDTH * BOARD_HEIGHT):
            self.tiles[i] = Tile()

    def get_tile(self, x, y):
        return self.tiles[y * BOARD_WIDTH + x]

    def set_tile(self, x, y, tile):
        self.tiles[y * BOARD_WIDTH + x] = tile

    def get_width():
        return BOARD_WIDTH

    def get_height():
        return BOARD_HEIGHT
