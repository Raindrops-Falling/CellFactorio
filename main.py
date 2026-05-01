import asyncio
from pyray import init_window
from pyray import window_should_close
from pyray import begin_drawing
from pyray import clear_background
from pyray import WHITE
from pyray import VIOLET
from pyray import draw_text
from pyray import end_drawing
from pyray import close_window
from pyray import load_image
from pyray import load_texture_from_image
from pyray import unload_image
from pyray import draw_texture
from pyray import unload_texture


async def main():
    init_window(500, 500, "Hello")

    fish_img = load_image("assets/fish.png")
    fish_tex = load_texture_from_image(fish_img)
    unload_image(fish_img)

    while not window_should_close():
        begin_drawing()
        clear_background(WHITE)
        draw_texture(fish_tex, 100, 100, WHITE)
        draw_text("Hello world", 190, 200, 20, VIOLET)
        end_drawing()
        await asyncio.sleep(0)

    unload_texture(fish_tex)
    close_window()

asyncio.run(main())
