---
title: "Drummond of Megginch Tartan thread counts"
date: 2022-06-10
tags: ["humphrey","jupyter"]
---

# Given thread counts produce table
Wait for this to come out

```python
test = "R14 DB2 R4 DB4 R70 LB4 R4 DB20 R4 G4 R4 G74 R6 DB4 R12"
```

```python
import re

PATTERN = re.compile("([a-zA-Z]*)(\d*)")

def split_thread(threadcount):
    """Given a thread count such as R14, will split to R and integer 14"""
    match = re.search(PATTERN, threadcount)
    if match:
        return match.group(1),match.group(2)
    return threadcount,""
    

class Stripe:
    def __init__(self, short_colour, count):
        self.short_colour = short_colour
        self.count = int(count)

    def __str__(self):
        return f"{self.short_colour}{self.count}"

class Tartan:
    def __init__(self):
        self.stripes = []
        
    @classmethod
    def from_space_threadcount(cls, threadcount):
        tartan = cls()
        threads = threadcount.split(" ")
        for thread in threads:
            colour,count = split_thread(thread)
            tartan.stripes.append(Stripe(colour, count))
        return tartan

    def __str__(self):
        s= ""
        for stripe in self.stripes:
            s += f"{stripe} "
        return s

    @property
    def threadcount(self):
        tc = 0
        for stripe in self.stripes:
            tc += stripe.count
        return tc

a = Tartan.from_space_threadcount(test)
print(f"Pattern = {a}")
print(f"Num threads = {a.threadcount}")
```

    Pattern = R14 DB2 R4 DB4 R70 LB4 R4 DB20 R4 G4 R4 G74 R6 DB4 R12 
    Num threads = 230

# Creating images
My first attempt at creating images was using a simple turtle graphics package:# Free after the example from the Python 3.5 manual

```python

from turtle import *

up()
goto (0, 0)
startPos = pos ()

def worp(height=100, size=5, gap=3):
    down()
    left(90)
    forward(height)
    up()
    right(90)
    forward(size + gap)
    right(90)
    down()
    forward(height)
    up()
    left(90)
    forward(size + gap)

def weft_path(width, size=5, gap=3):
    count = 0
    while True:
        down()
        forward(size + gap)
        up()
        forward(size)
        down()
        forward(gap)
        count += 2 * (size + gap)
        if count > width:
            break

def weft(width=100, size=5, gap=3):
    offset = -gap
    back(offset)
    weft_path(width)
    forward(offset)
    left(90)
    forward(size + gap)
    left(90)
    weft_path(width)
    right(90)
    forward(size + gap)
    right(90)

class TartanException(Exception):
    pass

def tartan_colour_to_svg_colour(colour):

    if colour == 'LR':
        return 'lightred'
    elif colour == 'R':
        return 'red'
    elif colour == 'DR':
        return 'darkred'
    elif colour == 'O':
        return 'orange'
    elif colour == 'DO':
        return 'darkorange'
    elif colour == 'LY':
        return 'lightyellow'
    elif colour == 'Y':
        return 'yellow'
    elif colour == 'DY':
        return 'darkyellow'
    elif colour == 'LG':
        return 'lightreen'
    elif colour == 'G':
        return 'green'
    elif colour == 'DG':
        return 'darkreen'
    elif colour == 'LB':
        return 'lightblue'
    elif colour == 'B':
        return 'blue'
    elif colour == 'DB':
        return 'darkblue'
    elif colour == 'LP':
        return 'lightpurple'
    elif colour == 'P':
        return 'purple'
    elif colour == 'DP':
        return 'darkpurple'
    elif colour == 'W':
        return 'white'
    elif colour == 'LN':
        return 'lightgray'
    elif colour == 'N':
        return 'gray'
    elif colour == 'DN':
        return 'darkgray'
    elif colour == 'K':
        return 'black'
    elif colour == 'LT':
        return 'lightbrown'
    elif colour == 'T':
        return 'brown'
    elif colour == 'DT':
        return 'darkbrown'
    else:
        raise TartanException(f'Colour {colour} is not defined')

def tartan(pattern_list, height, width, size, gap):
    pensize(size)

    goto(size, 0)
    counter = 0
    while True:
        for this_colour, repeat in pattern_list:
            color(tartan_colour_to_svg_colour(this_colour))
            for i in range(repeat):
                worp(height, size, gap)
                counter += 2 * (size + gap)
                if counter > width:
                    break
            if counter > width:
                break
        if counter > width:
            break
    up()

    goto(2-size/2, -size/2)
    counter = 0
    while True:
        for this_colour, repeat in pattern_list:
            color(tartan_colour_to_svg_colour(this_colour))
            for i in range(repeat):
                weft(width, size, gap)
                counter += 2 * (size + gap)
                if counter > height:
                    break
            if counter > height:
                break
        if counter > width:
            break
    up()

def box(height, width):
    mine = Turtle()
    # Black border
    mine.pensize(1)
    mine.color('black')
    mine.down()
    mine.forward(width)
    mine.left(90)
    mine.forward(height)
    mine.left(90)
    mine.forward(width)
    mine.left(90)
    mine.forward(height)
    mine.done()

# https://www.tartanregister.gov.uk/docs/Colour_shades.pdf
TartanColours = (
    ('LR', 'Light Red', (0xE8CCB8, 0x878787, 0xEC34C4)),
    ('R', 'Red'),
    ('DR', 'Dark Red'),
    ('O', 'Orange'),
    ('DO', 'Dark Orange'),
    ('LY', 'Light Yellow'),
    ('Y', 'Yellow'),
    ('DY', 'Dark Yellow'),
    ('LG', 'Light Green'),
    ('G', 'Green'),
    ('DG', 'Dark Green'),
    ('LB', 'Light Blue'),
    ('B', 'Blue'),
    ('DB', 'Dark Blue'),
    ('LP', 'Light Purple'),
    ('P', 'Purple'),
    ('DP', 'Dark Purple'),
    ('W', 'White'),
    ('LN', 'Light Grey'),
    ('N', 'Grey'),
    ('DN', 'Dark Grey'),
    ('K', 'Black'),
    ('LT', 'Light Brown'),
    ('T', 'Brown'),
    ('DT', 'Dark Brown'),
)

simple_tartan = (('R', 2),
          ('B', 1),
          ('G', 4),
          ('B', 1),
          ('R', 2),
          )

drummond_tartan = (('R', 12),
          ('B', 2),
          ('R', 4),
          ('B', 4),
          ('R', 64),
          ('LB', 4),
          ('R', 4),
          ('B', 16),
          ('R', 4),
          ('G', 4),
          ('R', 4),
          ('G', 48),
          ('R', 4),
          ('B', 4),
          ('R', 12),
          )

height = 800
width = 800
size = 10
gap = 6
tartan(simple_tartan, height, width, size, gap)
done()
box(width, width)

```
