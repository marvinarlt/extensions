import './../vendor/blob.js';
import './../vendor/fileSaver.js';

/**
 * Imagly - Compress all kind of images
 * 
 * @author Marvin Arlt
 * @date 2020-08-07
 * @version 0.1
 */
function Imagly()
{
    const _this = this;
    const _files = [];
    const _imageBlobs = [];

    let _currentCount = 0;
    let _fileCount = 0;
    let _zipBolb = null;

    this.load = function (uploadField)
    {
        const files = uploadField.files;
        _fileCount = files.length;

        for (let index = 0; index < _fileCount; index++) {
            const file = files[index];

            this.compress(file, index);
        }
    }

    this.compress = function (file, iteration)
    {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        // reader.onload = function (event)
        // {
        //     _this.onReaderLoad(event, file, iteration);
        // }
        reader.addEventListener('load', function (event)
        {
            _this.onReaderLoad(event, file, iteration);
        });
        reader.onerror = function (error)
        {
            console.error(error);
        }
    }

    this.onReaderLoad = function (event, file, iteration)
    {
        const fileName = file.name;
        const image = new Image();
        
        image.src = event.target.result;
        // image.onload = function ()
        // {
        //     _currentCount++;

        //     if (typeof _this.oncurrent === 'function') {
        //         _this.oncurrent(_currentCount, _fileCount);
        //     }

        //     _this.onImageLoad(image, fileName, iteration);
        // }
        image.addEventListener('load', function ()
        {
            _currentCount++;

            if (typeof _this.oncurrent === 'function') {
                _this.oncurrent(_currentCount, _fileCount);
            }

            _this.onImageLoad(image, fileName, iteration);
        });
    }

    this.onImageLoad = function (image, fileName, iteration)
    {
        const canvas = document.createElement('canvas');

        canvas.width = image.width;
        canvas.height = image.height;

        const context2d = canvas.getContext('2d');
        const fileExtension = _this.getFileExtension(fileName);

        context2d.drawImage(image, 0, 0, image.width, image.height);
        context2d.canvas.toBlob(function (blob)
        {
            _imageBlobs.push(blob);

            const file = new File([blob], fileName, {
                type: 'image/' + fileExtension,
                lastModified: Date.now()
            });

            _files.push(file);

            if (iteration !== (_fileCount - 1)) return;

            _this.createZip();            
        }, 'image/' + fileExtension, 0.66);
    }

    this.createZip = function ()
    {
        const jsZip = new JSZip();

        for (let index = 0; index < _files.length; index++) {
            const file = _files[index];
            const blob = _imageBlobs[index];

            jsZip.file(file.name, blob);
        }

        jsZip.generateAsync({type: 'blob'}).then(function (blob)
        {
            _zipBolb = blob;

            if (typeof _this.onfinished === 'function') {
                _this.onfinished();
            }
        }, function (error)
        {
            console.log(error);
        });
    }

    this.download = function ()
    {
        if (_zipBolb === null) return;

        saveAs(_zipBolb, 'compressed.zip');
    }

    this.getFileExtension = function (string)
    {
        string = string.split('.');
        string = string[string.length - 1];
        string = string.toLowerCase();

        if (string == 'jpg') {
            string = 'jpeg';
        }

        return string;
    }
}

const imagly = new Imagly();

export default imagly;