document.addEventListener('DOMContentLoaded', () => {
    const fileList = document.querySelector('.file-list');
    const pathBar = document.querySelector('.path-bar');
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

    function getIconClass(fileType) {
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
            default:
                return 'fas fa-file';
        }
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

    function showPreview(file) {
        const filePath = [...currentPath, file.name].join('/');
        previewContent.innerHTML = '';
        previewTitle.innerHTML = `<i class="${getIconClass(file.type)}"></i> ${file.name}`;

        if (file.type === 'image') {
            const img = document.createElement('img');
            img.src = `files/${filePath}`;
            img.alt = file.name;
            previewContent.appendChild(img);
        } else if (file.type === 'video') {
            const video = document.createElement('video');
            video.src = `files/${filePath}`;
            video.controls = true;
            video.autoplay = false;
            previewContent.appendChild(video);
        } else if (file.type === 'game') {
            const iframe = document.createElement('iframe');
            iframe.src = `files/${filePath}/index.html`;
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
        icon.className = getIconClass(file.type);
        
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
            } else if (file.type === 'image' || file.type === 'video' || file.type === 'game') {
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

        pathBar.innerHTML = breadcrumbs.join('');

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
            icon.className = getIconClass(file.type);
            
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
        .then(data => {
            fileStructure = data;
            collectAllFiles(data.files);
            displayFiles(data.files);
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