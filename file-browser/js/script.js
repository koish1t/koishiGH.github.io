document.addEventListener('DOMContentLoaded', () => {
    const bgImages = ['tetoBG.png', 'vivianBG.jpg'];
    const randomBg = bgImages[Math.floor(Math.random() * bgImages.length)];
    document.documentElement.style.setProperty('--random-bg', `url('../files/site-files/bgs/${randomBg}')`);

    const fileList = document.querySelector('.file-list');
    const pathNavigation = document.querySelector('.path-navigation');
    const previewPanel = document.querySelector('.preview-panel');
    const previewContent = document.querySelector('.preview-content');
    const previewTitle = document.querySelector('.preview-title');
    const overlay = document.querySelector('.preview-overlay');
    const searchPanel = document.querySelector('.search-panel');
    const searchPanelInput = document.querySelector('.search-panel-input');
    const searchPanelResults = document.querySelector('.search-panel-results');
    const searchBtn = document.querySelector('.search-btn');
    const searchPanelClose = document.querySelector('.search-panel-close');
    let currentPath = [];
    let fileStructure = null;
    let allFiles = [];

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    function getIconClass(fileType, fileName = '') {
        const ext = fileType === 'file' ? getFileExtension(fileName) : '';
        switch(fileType) {
            case 'directory':
                return 'fas fa-folder';
            case 'image':
                return 'fas fa-image';
            case 'video':
                return 'fas fa-video';
            case 'game':
                return 'fas fa-gamepad';
            case 'html':
                return 'fas fa-code';
            case 'css':
                return 'fas fa-css3';
            case 'js':
                return 'fas fa-js';
            case 'link':
                return 'fas fa-link';
            case 'file':
                switch(ext) {
                    case 'zip':
                    case 'rar':
                    case '7z':
                        return 'fas fa-file-archive';
                    case 'pdf':
                        return 'fas fa-file-pdf';
                    case 'doc':
                    case 'docx':
                        return 'fas fa-file-word';
                    case 'xls':
                    case 'xlsx':
                        return 'fas fa-file-excel';
                    case 'ppt':
                    case 'pptx':
                        return 'fas fa-file-powerpoint';
                    case 'mp3':
                    case 'wav':
                    case 'ogg':
                        return 'fas fa-file-audio';
                    case 'txt':
                    case 'md':
                        return 'fas fa-file-alt';
                    default:
                        return 'fas fa-file';
                }
            default:
                return 'fas fa-file';
        }
    }

    function getFileExtension(fileName) {
        return fileName.split('.').pop().toLowerCase();
    }

    function getFileType(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
        if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
        if (ext === 'html') return 'html';
        if (ext === 'css') return 'css';
        if (ext === 'js') return 'js';
        return 'file';
    }

    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    }

    async function getFileSize(filePath) {
        try {
            const cleanPath = `files/${filePath.replace(/^\/+/, '')}`;
            const response = await fetch(`/${cleanPath}`, {
                method: 'HEAD',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            if (!response.ok) {
                console.warn(`Failed to get size for ${cleanPath}:`, response.status);
                return null;
            }
            const size = response.headers.get('content-length');
            return size ? parseInt(size) : null;
        } catch (error) {
            console.error('Error fetching file size:', error);
            return null;
        }
    }

    async function updateFileWithSize(file, parentPath = []) {
        if (!file) return;
        
        const filePath = [...parentPath, file.name].join('/');
        if (file.type !== 'directory' && file.type !== 'link') {
            console.log('Fetching size for:', filePath);
            const size = await getFileSize(filePath);
            if (size !== null) {
                file.size = formatFileSize(size);
                console.log('Size for', filePath, ':', file.size);
            } else {
                console.warn('Could not get size for:', filePath);
            }
        }
        
        if (file.children) {
            for (const child of file.children) {
                await updateFileWithSize(child, [...parentPath, file.name]);
            }
        }
    }

    function createFilePreview(file) {
        const previewContent = document.querySelector('.preview-content');
        const isVideo = file.name.match(/\.(mp4|webm|mov|avi|wmv|flv|mkv)$/i);
        
        if (isVideo) {
            const container = document.createElement('div');
            container.className = 'file-preview-container';
            
            const video = document.createElement('video');
            video.src = file.url;
            video.style.display = 'none';
            
            const thumbnailContainer = document.createElement('div');
            thumbnailContainer.className = 'video-thumbnail-container';
            
            const canvas = document.createElement('canvas');
            
            video.addEventListener('loadeddata', () => {
                canvas.width = 320;
                canvas.height = (canvas.width / video.videoWidth) * video.videoHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                const thumbnail = document.createElement('img');
                thumbnail.className = 'video-thumbnail';
                thumbnail.src = canvas.toDataURL();
                thumbnailContainer.appendChild(thumbnail);
                
                const overlay = document.createElement('div');
                overlay.className = 'video-thumbnail-overlay';
                overlay.innerHTML = '<i class="fas fa-play"></i>';
                thumbnailContainer.appendChild(overlay);
                
                video.remove();
                canvas.remove();
            });
            
            video.addEventListener('error', () => {
                thumbnailContainer.innerHTML = '<i class="fas fa-video file-preview-icon"></i>';
            });
            
            container.appendChild(thumbnailContainer);
            
            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-preview-info';
            fileInfo.innerHTML = `
                <h2>${file.name}</h2>
                <div class="file-size">
                    <i class="fas fa-file-video"></i>
                    <span>Loading size...</span>
                </div>
                <div class="file-preview-buttons">
                    <button class="preview-btn" onclick="window.open('${file.url}', '_blank')">
                        <i class="fas fa-download"></i>
                        Download
                    </button>
                    <button class="preview-btn copy-btn" onclick="copyFileUrl('${file.url}')">
                        <i class="fas fa-link"></i>
                        Copy Link
                    </button>
                    <button class="preview-btn qr-btn" onclick="showQRCode('${file.url}')">
                        <i class="fas fa-qrcode"></i>
                        QR Code
                    </button>
                </div>
            `;
            container.appendChild(fileInfo);
            
            const modeSelect = document.createElement('select');
            modeSelect.className = 'preview-mode-select';
            modeSelect.innerHTML = `
                <option value="thumbnail">Thumbnail View</option>
                <option value="player">Video Player</option>
            `;
            modeSelect.addEventListener('change', (e) => {
                if (e.target.value === 'player') {
                    const videoPlayer = document.createElement('video');
                    videoPlayer.src = file.url;
                    videoPlayer.controls = true;
                    videoPlayer.style.maxWidth = '100%';
                    videoPlayer.style.maxHeight = 'calc(80vh - 4rem)';
                    container.replaceChild(videoPlayer, thumbnailContainer);
                } else {
                    container.replaceChild(thumbnailContainer, container.firstChild);
                }
            });
            container.appendChild(modeSelect);
            
            previewContent.innerHTML = '';
            previewContent.appendChild(container);
            
            updateFileSize(file.url, fileInfo.querySelector('.file-size span'));
        } else {
        }
    }

    function showPreview(file) {
        const filePath = [...currentPath, file.name].join('/');
        previewContent.innerHTML = '';
        previewTitle.innerHTML = `<i class="${getIconClass(file.type, file.name)}"></i> ${file.name}`;

        if (file.type === 'image') {
            const img = document.createElement('img');
            img.src = `/files/${filePath}`;
            img.alt = file.name;
            previewContent.appendChild(img);
        } else if (file.type === 'video') {
            const modeSelect = document.createElement('select');
            modeSelect.className = 'preview-mode-select';
            modeSelect.innerHTML = `
                <option value="video">Video Player</option>
                <option value="download">Download View</option>
            `;
            previewContent.appendChild(modeSelect);

            const videoContainer = document.createElement('div');
            const downloadContainer = document.createElement('div');

            const video = document.createElement('video');
            video.src = `/files/${filePath}`;
            video.controls = true;
            video.autoplay = false;
            videoContainer.appendChild(video);

            downloadContainer.className = 'file-preview-container';
            downloadContainer.style.display = 'none';
            
            const iconContainer = document.createElement('div');
            iconContainer.className = 'file-preview-icon';
            iconContainer.innerHTML = `<i class="${getIconClass(file.type, file.name)}"></i>`;
            
            const infoContainer = document.createElement('div');
            infoContainer.className = 'file-preview-info';
            
            const fileName = document.createElement('h2');
            fileName.textContent = file.name;
            
            const fileSize = document.createElement('p');
            fileSize.className = 'file-size';
            if (file.size) {
                fileSize.innerHTML = `<i class="fas fa-file"></i> ${file.size} • ${formatDate(file.lastModified)}`;
            } else {
                getFileSize(filePath).then(size => {
                    if (size !== null) {
                        file.size = formatFileSize(size);
                        fileSize.innerHTML = `<i class="fas fa-file"></i> ${file.size} • ${formatDate(file.lastModified)}`;
                    } else {
                        fileSize.innerHTML = `<i class="fas fa-file"></i> Size unavailable • ${formatDate(file.lastModified)}`;
                    }
                });
                fileSize.innerHTML = `<i class="fas fa-file"></i> Loading size... • ${formatDate(file.lastModified)}`;
            }
            
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'file-preview-buttons';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'preview-btn copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-link"></i> Copy link';
            copyBtn.onclick = () => {
                const fileUrl = `${window.location.origin}/files/${filePath}`;
                navigator.clipboard.writeText(fileUrl);
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-link"></i> Copy link';
                }, 2000);
            };
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'preview-btn download-btn';
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
            downloadBtn.onclick = () => {
                window.open(`/files/${filePath}`, '_blank');
            };
            
            const qrBtn = document.createElement('button');
            qrBtn.className = 'preview-btn qr-btn';
            qrBtn.innerHTML = '<i class="fas fa-qrcode"></i>';
            
            infoContainer.appendChild(fileName);
            infoContainer.appendChild(fileSize);
            buttonContainer.appendChild(copyBtn);
            buttonContainer.appendChild(downloadBtn);
            buttonContainer.appendChild(qrBtn);
            infoContainer.appendChild(buttonContainer);
            
            downloadContainer.appendChild(iconContainer);
            downloadContainer.appendChild(infoContainer);

            previewContent.appendChild(videoContainer);
            previewContent.appendChild(downloadContainer);

            modeSelect.addEventListener('change', (e) => {
                if (e.target.value === 'video') {
                    videoContainer.style.display = 'block';
                    downloadContainer.style.display = 'none';
                } else {
                    videoContainer.style.display = 'none';
                    downloadContainer.style.display = 'flex';
                }
            });

        } else if (file.type === 'game') {
            const iframe = document.createElement('iframe');
            iframe.src = `/files/${filePath}/index.html`;
            iframe.className = 'game-frame';
            iframe.setAttribute('allow', 'fullscreen');
            previewContent.appendChild(iframe);
            
            const fullscreenBtn = document.createElement('button');
            fullscreenBtn.className = 'fullscreen-btn';
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            fullscreenBtn.addEventListener('click', () => {
                if (iframe.requestFullscreen) {
                    iframe.requestFullscreen();
                } else if (iframe.webkitRequestFullscreen) {
                    iframe.webkitRequestFullscreen();
                } else if (iframe.msRequestFullscreen) {
                    iframe.msRequestFullscreen();
                }
            });
            previewContent.appendChild(fullscreenBtn);
        } else if (file.type === 'file') {
            const container = document.createElement('div');
            container.className = 'file-preview-container';
            
            const iconContainer = document.createElement('div');
            iconContainer.className = 'file-preview-icon';
            iconContainer.innerHTML = `<i class="${getIconClass(file.type, file.name)}"></i>`;
            
            const infoContainer = document.createElement('div');
            infoContainer.className = 'file-preview-info';
            
            const fileName = document.createElement('h2');
            fileName.textContent = file.name;
            
            const fileSize = document.createElement('p');
            fileSize.className = 'file-size';
            if (file.size) {
                fileSize.innerHTML = `<i class="fas fa-file"></i> ${file.size} • ${formatDate(file.lastModified)}`;
            } else {
                getFileSize(filePath).then(size => {
                    if (size !== null) {
                        file.size = formatFileSize(size);
                        fileSize.innerHTML = `<i class="fas fa-file"></i> ${file.size} • ${formatDate(file.lastModified)}`;
                    } else {
                        fileSize.innerHTML = `<i class="fas fa-file"></i> Size unavailable • ${formatDate(file.lastModified)}`;
                    }
                });
                fileSize.innerHTML = `<i class="fas fa-file"></i> Loading size... • ${formatDate(file.lastModified)}`;
            }

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'file-preview-buttons';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'preview-btn copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-link"></i> Copy link';
            copyBtn.onclick = () => {
                const fileUrl = `${window.location.origin}/files/${filePath}`;
                navigator.clipboard.writeText(fileUrl);
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-link"></i> Copy link';
                }, 2000);
            };

            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'preview-btn download-btn';
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
            downloadBtn.onclick = () => {
                window.open(`/files/${filePath}`, '_blank');
            };

            const qrBtn = document.createElement('button');
            qrBtn.className = 'preview-btn qr-btn';
            qrBtn.innerHTML = '<i class="fas fa-qrcode"></i>';

            infoContainer.appendChild(fileName);
            infoContainer.appendChild(fileSize);
            buttonContainer.appendChild(copyBtn);
            buttonContainer.appendChild(downloadBtn);
            buttonContainer.appendChild(qrBtn);
            infoContainer.appendChild(buttonContainer);

            container.appendChild(iconContainer);
            container.appendChild(infoContainer);
            previewContent.appendChild(container);
        }

        requestAnimationFrame(() => {
            overlay.classList.remove('hidden');
            previewPanel.classList.remove('hidden');
        });
    }

    function hidePreview() {
        previewPanel.classList.add('hidden');
        overlay.classList.add('hidden');
        setTimeout(() => {
            previewContent.innerHTML = '';
        }, 300);
    }

    document.querySelector('.close-preview').addEventListener('click', (e) => {
        e.stopPropagation();
        hidePreview();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            hidePreview();
        }
    });

    function createFileItem(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';

        const icon = document.createElement('i');
        icon.className = getIconClass(file.type, file.name);

        const name = document.createElement('span');
        name.textContent = file.name;

        const date = document.createElement('span');
        date.className = 'modified-date';
        date.textContent = formatDate(file.lastModified);

        fileItem.appendChild(icon);
        fileItem.appendChild(name);
        fileItem.appendChild(date);

        fileItem.addEventListener('click', () => {
            document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
            fileItem.classList.add('active');

            if (file.type === 'directory') {
                currentPath.push(file.name);
                updatePathBar();
                navigateToCurrentPath();
            } else if (file.type === 'link' && file.url) {
                window.open(file.url, '_blank');
            } else if (file.type === 'image' || file.type === 'video' || file.type === 'game' || file.type === 'file') {
                showPreview(file);
            }
        });
        return fileItem;
    }

    function getCurrentFolder() {
        let current = fileStructure.files;
        for (const folder of currentPath) {
            const found = current.find(item => item.name === folder);
            if (found && found.children) {
                current = found.children;
            } else {
                return null;
            }
        }
        return current;
    }

    function navigateToCurrentPath() {
        const currentFolder = getCurrentFolder();
        if (currentFolder) {
            displayFiles(currentFolder);
        } else {
            console.error('Invalid path');
        }
    }

    function updatePathBar() {
        const pathElements = ['<i class="fas fa-home"></i> Home'];
        pathElements.push(...currentPath);

        const breadcrumbs = pathElements.map((item, index) => {
            if (index === 0) {
                return `<span class="path-item" data-index="-1">${item}</span>`;
            }
            return `<span class="path-separator">/</span><span class="path-item" data-index="${index - 1}">${item}</span>`;
        });

        pathNavigation.innerHTML = breadcrumbs.join('');

        document.querySelectorAll('.path-item').forEach(item => {
        item.addEventListener('click', () => {
                const index = parseInt(item.getAttribute('data-index'));
                if (index === -1) {
                    currentPath = [];
                } else {
                    currentPath = currentPath.slice(0, index + 1);
                }
                updatePathBar();
                navigateToCurrentPath();
            });
        });
    }

    function displayFiles(files) {
        fileList.innerHTML = '';

        if (currentPath.length > 0) {
            const backItem = document.createElement('div');
            backItem.className = 'file-item';

            const icon = document.createElement('i');
            icon.className = 'fas fa-arrow-left';

            const name = document.createElement('span');
            name.textContent = '..';
            
            backItem.appendChild(icon);
            backItem.appendChild(name);
            
            backItem.addEventListener('click', () => {
                currentPath.pop();
                updatePathBar();
                navigateToCurrentPath();
            });
            
            fileList.appendChild(backItem);
        }

        files.forEach(file => {
            if (!file.type && file.name) {
                file.type = getFileType(file.name);
            }
            const fileItem = createFileItem(file);
            fileList.appendChild(fileItem);
        });
    }

    function collectAllFiles(files, parentPath = []) {
        files.forEach(file => {
            const currentPath = [...parentPath, file.name];
            if (file.type === 'directory' && file.children) {
                collectAllFiles(file.children, currentPath);
            } else {
                allFiles.push({
                    ...file,
                    path: currentPath,
                    fullPath: currentPath.join('/')
                });
            }
        });
    }

    function toggleSearchPanel() {
        searchPanel.classList.toggle('active');
        if (searchPanel.classList.contains('active')) {
            searchPanelInput.focus();
            if (searchPanelInput.value.trim()) {
                performSearch(searchPanelInput.value);
            }
        } else {
            searchPanelInput.value = '';
            displayFiles(getCurrentFolder() || fileStructure.files);
        }
    }

    function performSearch(query) {
        if (!query.trim()) {
            searchPanelResults.innerHTML = '';
            return;
        }

        const searchResults = allFiles.filter(file => {
            const searchString = `${file.fullPath} ${file.type}`.toLowerCase();
            return searchString.includes(query.toLowerCase());
        });

        displaySearchResults(searchResults);
    }

    function displaySearchResults(results) {
        searchPanelResults.innerHTML = '';
        
        if (results.length === 0) {
            searchPanelResults.innerHTML = '<div class="file-item"><i class="fas fa-info-circle"></i><span>No results found</span></div>';
            return;
        }

        results.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const icon = document.createElement('i');
            icon.className = getIconClass(file.type, file.name);
            
            const nameContainer = document.createElement('div');
            nameContainer.className = 'name-container';
            
            const name = document.createElement('span');
            name.textContent = file.name;
            
            const path = document.createElement('span');
            path.className = 'file-path';
            path.textContent = file.path.slice(0, -1).join('/');
            
            nameContainer.appendChild(name);
            if (path.textContent) {
                nameContainer.appendChild(path);
            }
            
            const date = document.createElement('span');
            date.className = 'modified-date';
            date.textContent = formatDate(file.lastModified);
            
            fileItem.appendChild(icon);
            fileItem.appendChild(nameContainer);
            fileItem.appendChild(date);
            
            fileItem.addEventListener('click', () => {
                currentPath = file.path.slice(0, -1);
                updatePathBar();
                navigateToCurrentPath();

                if (file.type === 'image' || file.type === 'video') {
                    setTimeout(() => {
                        showPreview(file);
                    }, 100);
                }

                setTimeout(() => {
                    const fileElements = document.querySelectorAll('.file-item');
                    fileElements.forEach(el => {
                        if (el.querySelector('span').textContent === file.name) {
                            el.classList.add('active');
                        }
                    });
                }, 100);

                toggleSearchPanel();
            });
            
            searchPanelResults.appendChild(fileItem);
        });
    }

    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleSearchPanel();
    });

    searchPanelClose.addEventListener('click', () => {
        toggleSearchPanel();
    });

    searchPanelInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    searchPanelInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleSearchPanel();
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchPanel.contains(e.target) && 
            !searchBtn.contains(e.target) && 
            searchPanel.classList.contains('active')) {
            toggleSearchPanel();
        }
    });

    fetch('files/file-structure.json')
        .then(response => response.json())
        .then(async data => {
            fileStructure = data;
            await updateFileWithSize(data);
            displayFiles(data.files);
            collectAllFiles(data.files);
            updatePathBar();
        })
        .catch(error => {
            console.error('Error loading file structure:', error);
            fileList.innerHTML = '<div class="error">Failed to load file structure</div>';
        });

    const menuBtn = document.querySelector('.menu-btn');
    const slideMenu = document.querySelector('.slide-menu');

    menuBtn.addEventListener('click', () => {
        slideMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!slideMenu.contains(e.target) && !menuBtn.contains(e.target) && slideMenu.classList.contains('active')) {
            slideMenu.classList.remove('active');
        }
    });

    const readmeElement = document.getElementById('readme');
    if (readmeElement) {
        fetch('README.md')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load README.md');
                }
                return response.text();
            })
            .then(markdownContent => {
                marked.setOptions({
                    gfm: true,
                    breaks: true,
                    headerIds: true
                });
                readmeElement.innerHTML = marked.parse(markdownContent);
            })
            .catch(error => {
                console.error('Error loading README:', error);
                readmeElement.innerHTML = '<p class="error">Failed to load README.md</p>';
            });
    }
});