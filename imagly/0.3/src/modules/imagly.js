/**
 * Imagly - Compress all kind of images
 * 
 * @uses JSZip - https://stuk.github.io/jszip/
 * @uses Blob.js - https://github.com/eligrey/Blob.js/
 * @uses FileSaver - https://github.com/eligrey/FileSaver.js/
 * 
 * @author Marvin Arlt
 * @date 2020-08-09
 * @version 0.3
 */
function Imagly()
{
    const _this = this;
    const _defaultSettings = {
        quality: 0.8,
        formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        autoDownload: false
    };

    let _settings = null;
    let _events = {};
    let _uncompressedFiles = null;
    let _compressedFiles = [];
    let _fileBlobs = [];
    let _fileCount = 0;
    let _iteration = 0;

    /**
     * Loads the files from the input field
     * 
     * @param {node} fileInput 
     */
    this.load = function (fileInput)
    {
        _uncompressedFiles = fileInput.files;
        _fileCount = _uncompressedFiles.length;
    }

    /**
     * Starts the compressing process
     * 
     * @param {object} settings 
     */
    this.compress = function (settings)
    {
        _settings = this.mergeObjects(_defaultSettings, settings);

        this.triggerEvent('start', {
            count: _fileCount
        });

        this.readFile(_uncompressedFiles[_iteration]);
    }

    /**
     * Reads the file data
     * 
     * @param {object} file 
     */
    this.readFile = function (file)
    {
        this.triggerEvent('compressing', {
            currentCount: _iteration + 1,
            count: _fileCount
        });

        const fileReader = new FileReader();
        const fileName = file.name;

        fileReader.readAsDataURL(file);

        fileReader.onload = function ()
        {
            _this.fileDataToImage(fileReader, fileName);
        }

        fileReader.onerror = function (error)
        {
            _this.triggerEvent('error', error);
        }
    }

    /**
     * Converts the base64 data to an image
     * 
     * @param {object} fileReader 
     * @param {string} fileName 
     */
    this.fileDataToImage = function (fileReader, fileName)
    {
        const image = new Image();
        const imageSrc = fileReader.result;

        image.src = imageSrc;

        image.onload = function ()
        {
            _this.imageToBlob(image, fileName);
        }
    }

    /**
     * Converts a image to a blob
     * 
     * @param {object} image 
     * @param {string} fileName 
     */
    this.imageToBlob = function (image, fileName)
    {
        const canvas = this.createCanvas(image, image.width, image.height);
        const extension = this.getExtension(fileName);

        if (extension === null && _iteration < _fileCount) {
            _iteration++;

            this.readFile(_uncompressedFiles[_iteration]);
            return;
        }

        canvas.toBlob(function (blob)
        {
            _this.saveBlob(blob, fileName, extension);
        }, 'image/' + extension, _settings.quality);
    }

    /**
     * Adds the compressed file to an array.
     * If it is the last file it will be
     * create also a zip file.
     * 
     * @param {object} blob 
     */
    this.saveBlob = function (blob, fileName, extension)
    {
        _fileBlobs.push(blob);

        const file = new File([blob], fileName, {
            type: 'image/' + extension,
            lastModified: Date.now()
        });

        _compressedFiles.push(file);

        _iteration++;

        if (_iteration == _fileCount) {
            this.createZip();
            return;
        }

        this.readFile(_uncompressedFiles[_iteration]);
    }

    /**
     * Creates a zip file
     */
    this.createZip = function ()
    {
        const zip = new JSZip();

        for (let index = 0; index < _fileBlobs.length; index++) {
            const fileName = _compressedFiles[index].name;
            const blob = _fileBlobs[index];

            zip.file(fileName, blob);
        }

        this.triggerEvent('zipping');

        zip.generateAsync({type: 'blob'}).then(function (blob)
        {
            _zipFile = blob;

            if (_settings.autoDownload) {
                _this.download();
            }

            _this.triggerEvent('finish');
        }, function (error)
        {
            _this.triggerEvent('error', error);
        });
    }

    /**
     * Saves the created zip file on your computer
     */
    this.download = function ()
    {
        if (_zipFile == null) return;

        saveAs(_zipFile, 'compressed.zip');
    }

    /**
     * Sets the event with a callback function
     * 
     * @param {string} eventName 
     * @param {function} callback 
     */
    this.on = function (eventName, callback)
    {
        _events[eventName] = callback;
    }

    /**
     * Triggers the event callback function
     * 
     * @param {string} eventName 
     * @param {object} eventObject 
     */
    this.triggerEvent = function(eventName, eventObject)
    {
        if (!_events.hasOwnProperty(eventName)) return;

        _events[eventName](eventObject);
    }

    /**
     * Creates a correct sized canvas with the image
     * 
     * @param {object} image 
     * @param {integer} width 
     * @param {integer} height 
     * @return {object}
     */
    this.createCanvas = function (image, width, height)
    {
        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');

        context.drawImage(image, 0, 0, width, height);

        return context.canvas;
    }

    /**
     * Returns the extension of a file name
     * 
     * @param {string} string 
     * @return {string}
     */
    this.getExtension = function (string)
    {
        string = string.split('.');
        string = string[string.length - 1];
        string = string.toLowerCase();

        if (_settings.formats.indexOf(string) == -1) {
            return null;
        }

        switch (string) {
            case 'jpg':
                string = 'jpeg';
                break;
            default:
                break;
        }

        return string;
    }

    /**
     * Combine two objects
     * 
     * @param {object} target 
     * @param {object} source 
     */
    this.mergeObjects = function (target, source)
    {
        return Object.assign(target, source);
    }
}