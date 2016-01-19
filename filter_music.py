# script to run a frequency analysis on given audio file to determine strength in different passbands
import numpy as np
import matplotlib.pyplot as pyplt
import scipy.io.wavfile as wav
import scipy.signal as signal

def analyze(finname, pps, cutlow, cuthigh, foutname):
    Fs, arr = wav.read(finname)
    dt = 1.0 / Fs
    spp = Fs / pps
    numper = arr.shape[0] / spp

    #if multiple channels (i.e. stereo), sum them into one
    if (len(arr.shape) == 2):
        arr = np.sum(arr, axis=1, dtype=np.int64)

    #Blow,Alow = signal.butter(2, cutlow / (Fs / 2.0), btype='lowpass', analog=False, output='ba')
    #Bhigh,Ahigh = signal.butter(2, cuthigh / (Fs / 2.0), btype='highpass', analog=False, output='ba')

    fout = open(foutname, 'w')
    fout.write(str(pps)+'\n')
    for i in range(numper):
        #arrlow = signal.filtfilt(Blow,Alow,arr[i*spp : (i+1)*spp])
        #arrhigh = signal.filtfilt(Bhigh,Ahigh,arr[i*spp : (i+1)*spp])
        """
        fourier = np.fft.fft(arr[i*spp : (i+1)*spp])
        freq = np.fft.fftfreq(spp, dt)
        #get strongest frequency components in both bands
        fmaxind = 0
        fmaxindlow = 0
        fmaxindhigh = 0
        fmag = np.abs(fourier)

        for j in range(fmag.size):
            if (fmag[j] > fmag[fmaxind] and freq[j] > 0):
                fmaxind = j
            if (fmag[j] > fmag[fmaxindlow] and freq[j] > 0 and freq[j] < cutlow):
                fmaxindlow = j
            if (fmag[j] > fmag[fmaxindhigh] and freq[j] > 0 and freq[j] > cuthigh):
                fmaxindhigh = j
        fout.write(str(freq[fmaxind]) + ',' + str(fmag[fmaxind]) + ',' +
            str(freq[fmaxindlow]) + ',' + str(fmag[fmaxindlow]) + ',' +
            str(freq[fmaxindhigh]) + ',' + str(fmag[fmaxindhigh]) + '\n')

        """
        #"""
        #get estimate of signal strength from periodogram
        freq1, pxx_spec = signal.periodogram(arr[i*spp : (i+1)*spp], Fs, 'flattop', scaling='spectrum')
        amaxind = 0
        amaxindlow = 0
        amaxindhigh = 0

        for j in range(pxx_spec.size):
            if (pxx_spec[j] > pxx_spec[amaxind]):
                amaxind = j
            if (pxx_spec[j] > pxx_spec[amaxindlow] and freq1[j] < cutlow):
                amaxindlow = j
            if ((freq1[j] > cuthigh and freq1[amaxindhigh] < cuthigh) or (pxx_spec[j] > pxx_spec[amaxindhigh] and freq1[j] > cuthigh)):
                amaxindhigh = j

        fout.write(str(freq1[amaxind]) + ',' + str(np.sqrt(pxx_spec[amaxind])) + ',' +
            str(freq1[amaxindlow]) + ',' + str(np.sqrt(pxx_spec[amaxindlow])) + ',' +
            str(freq1[amaxindhigh]) + ',' + str(np.sqrt(pxx_spec[amaxindhigh])) + '\n')
        #"""
        """
        print freq1[amaxind]
        print np.sqrt(pxx_spec[amaxind])
        print freq1[amaxindlow]
        print np.sqrt(pxx_spec[amaxindlow])
        print freq1[amaxindhigh]
        print np.sqrt(pxx_spec[amaxindhigh])
        """
    fout.close()

## used for testing different methods of analyzing the frequency/power spectrum
def debugfunc():
    #threshold - 3e7 ?
    Fs, arr = wav.read('music/2khzsine.wav')
    dt = 1.0 / Fs
    print Fs
    print dt
    print arr.shape
    fourier = np.fft.fft(arr)
    N = arr.size
    print N
    freq = np.fft.fftfreq(N, dt)
    idx = np.argsort(freq)
    #pyplt.plot(freq[idx], np.abs(fourier[idx]))
    #pyplt.show()

    #threshold - 15000?
    B,A = signal.butter(2, 2000 / (Fs / 2.0), btype='lowpass', analog=False, output='ba')
    arrfilt = signal.filtfilt(B,A,arr)
    fig = pyplt.figure()
    ax1 = fig.add_subplot(211)
    time = np.arange(0, 1.0 * arr.size / Fs, dt)
    print time.shape
    print arr.shape
    print arrfilt.shape
    #pyplt.plot(time[0:100], arr[0:100], 'b-')
    #pyplt.plot(time[0:100], arrfilt[0:100], 'r-')
    #pyplt.show()

    #threshold - 11300?
    f, pxx_spec = signal.periodogram(arr, Fs, 'flattop', scaling='spectrum')
    print arr.max()
    print np.sqrt(pxx_spec.max())
    #pyplt.figure()
    #pyplt.semilogy(f, np.sqrt(pxx_spec))
    #pyplt.show()

if __name__ == '__main__':
    finname = 'ReadyerrNot'
    analyze('music/'+finname+'.wav', 40, 400, 800, 'data/'+finname+'.csv')
