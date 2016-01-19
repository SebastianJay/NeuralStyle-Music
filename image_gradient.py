import numpy as np
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from scipy import ndimage as ndimg

def rgb2gray(rgb):
    return np.dot(rgb[...,:3], [0.299, 0.587, 0.144])

def threshold(arr, low, high):
    arr[arr < low] = low
    arr[arr > high] = high
    return arr

def analyze(finname, foutname):
    img = mpimg.imread(finname)
    if finname[-3:] == 'jpg':
        img = img.astype(np.float32) / 255.0
    gray = rgb2gray(img)
    gray = ndimg.gaussian_filter(gray, sigma=2.5)
    gray = threshold(gray, 0.0, 1.0)
    gray = (gray * 255.0).astype(np.int16)
    dy, dx = np.gradient(gray)
    fout = open(foutname, 'w')
    fout.write(str(dx.shape[0])+','+str(dx.shape[1])+'\n')
    for i in range(dx.shape[0]):
        for j in range(dx.shape[1]):
            if j > 0:
                fout.write(',')
            fout.write(str(dx[i,j]))
        fout.write('\n')
    for i in range(dy.shape[0]):
        for j in range(dy.shape[1]):
            if j > 0:
                fout.write(',')
            fout.write(str(dy[i,j]))
        fout.write('\n')
    fout.close()

def debugfunc():
    finname = 'img/water3_starry50_scream50.jpg'
    img = mpimg.imread(finname)
    if finname[-3:] == 'jpg':
        #img is uint8 from 0 to 255
        img = img.astype(np.float32) / 255.0

    gray = rgb2gray(img)
    gray = ndimg.gaussian_filter(gray, sigma=2.5)
    #plt.figure()
    #plt.imshow(gray, cmap=plt.get_cmap('gray'))

    gray = threshold(gray, 0.0, 1.0)
    gray = (gray * 255.0).astype(np.int16)
    dy, dx = np.gradient(gray)
    #dy = np.flipud(dy)
    #dx = np.flipud(dx)
    w,h = gray.shape[0], gray.shape[1]
    x, y = np.mgrid[0:h, 0:w]
    skip = (slice(None, None, 3), slice(None, None, 3))

    fig, ax = plt.subplots()
    im = ax.imshow(np.flipud(gray), extent=[x.min(), x.max(), y.min(), y.max()], cmap=plt.get_cmap('gray'))
    ax.quiver(x[skip], y[skip], dx[skip].T, dy[skip].T)
    plt.show()


if __name__ == '__main__':
    infile = 'galaxy_nude50_comp50'
    analyze('img/'+infile+'.jpg', 'data/'+infile+'_field.csv')
    #debugfunc()
