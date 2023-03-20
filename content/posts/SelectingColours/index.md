
---
title: "Selecting Colours"
date: 2023-03-19
slug: colour-selection
---

This is a broader description about selecting colours.  See the [selection of colours](/posts/colours/) for the choices of base colours.


This is partly my journey on discovering how to select and specify colours.  When you start looking at colour spaces you can start with [Wikipedia](https://en.wikipedia.org/wiki/Color_space).  I am keen to know how much a colour varies from a standard colour and what a a standard colour is.

## Linear transformations
On my computer I have an sRGB monitor iwth a gamma of 2.2 which seems quite accurate (Microsoft Surface)  However the gamut is limited compared to the Adobe gamut.

I can transform from one space to another but want to make sure the transformation is lossless.  So an out of gamut sRGB needs to use values greater than 255 and small than 0 to represent the whole colour space.

The CSS standard has looked at OKLAB as a colour space that is very similar to *LAB but gives more linear differences in the blue space.  This sounds exactly what I am looking for.

Many pictures use other models, eg the CIExy 1935 model is popular and the *LAB space is used as a more modern reference.  Eg the data colour tools support it.  However this is not used so much as a reference for textiles or paints.

There are refrences that have appeared.  

- Listed papers
- 

## Color checker

Eg the Gretag McBeth model and the current color checker:

[PDF](SpyderCheckr_Color_Data.pdf)

This is based on data the X-Rite published at one stage although they have now removed it from there web site.

The same author has modelled the Pantone colours although has avoided naming them as such and the efforts preserved in the internet archive:
SpyderCheckr_Color_Data.pdf

## Pigment based model

Pantone provide a reference based on mixing 15 inks to provide spot colour inks.  The names of these are then standardised.  They used ot have about 1200 but now have more than 2000.  The perceived colour though varies depending on how it is used.  Even with the same dilution and application there is a difference between printing on coated and uncoated papers.  This is not a small difference.

## Pictures and representations of colour

A problem that I have come acrosss is that my first generation weaving pattern is very simple but makes it easy to work out what colour you are using:

![](2023-03-19-23-37-32.png)

So the representation of the weave is solid colours.  The raw PNG gets scale when magnified under the browser.  Other weaving patterns give a more realistic version of a weave eg the [Scottish Tartan Registry](https://www.tartanregister.gov.uk/tartanLargeImage?ref=980):

![](2023-03-19-23-41-04.png)

The problem with this is that the pixels of each colour now vary depending on the position.  Additionally this is a JPEG so if you compress it (admittely this is a high compression) but you can see artifacts coming into the colour of each pixel:

![](2023-03-19-23-45-31.png)


## Colour distance

I am interested in measuring colour distance.  I am planning to use the simple DE in LAB space in the oklab space if the transform is reversible and then to measure the distance to nearest colours.  

The aim will be to show colour variations in small steps in a mapping of the 3 d version to a 2 d hexagonal map.  With the distance from target colour represented as the distance to the next known colour. 