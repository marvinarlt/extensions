const imagly = new Imagly();

const fileInput = document.querySelector('.imaglyUpload');
const contentOutput = document.querySelector('.imaglyOutputText');
const dropArea = document.querySelector('.uploadContainer');
const compressButton = document.querySelector('.imaglyCompress');
const downloadButton = document.querySelector('.imaglyDownload');

const compressSettings = {
    quality: 0.65,
    formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    autoDownload: false
};

fileInput.addEventListener('change', handleUpload);

compressButton.addEventListener('click', function ()
{
    imagly.load(fileInput);
    imagly.compress(compressSettings);
});

downloadButton.addEventListener('click', function ()
{
    imagly.download();
});

imagly.on('start', function ()
{
    dropArea.classList.remove('uploaded');
    dropArea.classList.add('loading');
    contentOutput.textContent = 'Starting...';
});

imagly.on('compressing', function (event)
{
    contentOutput.textContent = 'Compressing: ' + event.currentCount + '/' + event.count;
});

imagly.on('zipping', function ()
{
    contentOutput.textContent = 'Zipping...';
});

imagly.on('finish', function ()
{
    dropArea.classList.remove('loading');
    dropArea.classList.add('done');
    contentOutput.textContent = 'Done!';
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (eventName)
{
    dropArea.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(function (eventName)
{
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(function (eventName)
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

    fileInput.files = files;

    contentOutput.textContent = fileCount + ' Files';

    dropArea.classList.add('uploaded');
}

function handleUpload(event)
{
    const files = event.target.files;
    const fileCount = files.length;

    fileInput.files = files;

    contentOutput.textContent = fileCount + ' Files';

    dropArea.classList.add('uploaded');
}