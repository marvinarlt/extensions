import imagly from './modules/imagly.js';

const imaglyUpload = document.getElementById('imaglyUpload');
const imaglyCompress = document.getElementById('imaglyCompress');
const imaglyDownload = document.getElementById('imaglyDownload');
const dropArea = document.querySelector('.uploadContainer');
const currentFileOutput = document.querySelector('.fileStateOutput');

imaglyCompress.addEventListener('click', function ()
{
    dropArea.classList.remove('uploaded');
    dropArea.classList.add('loading');

    imagly.load(imaglyUpload);
});

imaglyDownload.addEventListener('click', function ()
{
    imagly.download();
});

imagly.onfinished = function ()
{
    dropArea.classList.remove('loading');
    dropArea.classList.add('done');
}

imagly.oncurrent = function (currentFile, fileCount)
{
    console.log(currentFile);
    currentFileOutput.textContent = currentFile + '/' + fileCount + ' Files';
}


;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (eventName)
{
    dropArea.addEventListener(eventName, preventDefaults, false);
});

;['dragenter', 'dragover'].forEach(function (eventName)
{
    dropArea.addEventListener(eventName, highlight, false);
});

;['dragleave', 'drop'].forEach(function (eventName)
{
    dropArea.addEventListener(eventName, unhighlight, false);
});

dropArea.addEventListener('drop', handleDrop, false);


function preventDefaults(event)
{
    event.preventDefault();
    event.stopPropagation();
}

function highlight()
{
    dropArea.classList.add('dragging');
}

function unhighlight()
{
    dropArea.classList.remove('dragging');
}

function handleDrop(event)
{
    const files = event.dataTransfer.files;
    const fileCount = files.length;

    imaglyUpload.files = files;

    currentFileOutput.textContent = fileCount + ' Files';

    dropArea.classList.add('uploaded');
}