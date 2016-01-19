# script to run the neural_style.lua repeatedly to get blend of two different styles

from subprocess import call, PIPE

#pathnames of content and style images
incontent = 'input/galaxy_small.jpg'
instyle1 = 'examples/inputs/seated-nude.jpg'
instyle2 = 'input/Composition-VII.jpg'
#output resolution
outsize = 512

#affects pathname of output files
outdir = 'output'
outprefix = 'galaxy'
outstylename1 = 'nude'
outstylename2 = 'comp'

#number of output images to produce
numblend = 5
delta = 100 // (numblend - 1)

for bw in range(0, 101, delta):
    comlst = []
    comlst.append('th')
    comlst.append('neural_style.lua')
    comlst.append('-style_image')
    comlst.append(instyle1+','+instyle2)
    comlst.append('-content_image')
    comlst.append(incontent)
    comlst.append('-output_image')
    comlst.append(outdir+'/'+outprefix+'_'+outstylename1+str(bw)+'_'+outstylename2+str(100-bw)+'.jpg')
    comlst.append('-style_blend_weights')
    comlst.append(str(bw)+','+str(100-bw))
    comlst.append('-image_size')
    comlst.append(str(outsize))
    comlst.append('-gpu')
    comlst.append('-1')
    comlst.append('-num_iterations')
    comlst.append('250')
    call(comlst, shell=False)

#debuglst = []
#debuglst.append('python')
#debuglst.append('-c')
#debuglst.append('print(\'Hello World\')')
#call(debuglst, shell=False, stdout=PIPE)
