        // Particles.js configuration
        if (document.getElementById('particles-js')) {
            particlesJS("particles-js", { 
                "particles": {
                    "number": {"value": 40, "density": {"enable": true, "value_area": 800}}, 
                    "color": {"value": "#4a5568"}, 
                    "shape": {"type": "circle"},
                    "opacity": {"value": 0.15, "random": true, "anim": {"enable": true, "speed": 0.2, "opacity_min": 0.03, "sync": false}},
                    "size": {"value": 2.5, "random": true},
                    "line_linked": {"enable": true, "distance": 180, "color": "#4a5568", "opacity": 0.1, "width": 1},
                    "move": {"enable": true, "speed": 0.6, "direction": "none", "random": true, "straight": false, "out_mode": "out"}
                },
                "interactivity": {"detect_on": "canvas", "events": {"onhover": {"enable": false}, "onclick": {"enable": false}, "resize": true}},
                "retina_detect": true
            });
        }

        const API_BASE_URL = "https://er-api.biz.id"; // Base URL for your specific APIs
        const GITHUB_REPO_USER = "ErBots"; // Replace with your GitHub username
        const GITHUB_REPO_NAME = "status-page-with-gemini"; // Replace with your repository name
        const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

        document.getElementById('githubIssueLink').href = `https://github.com/${GITHUB_REPO_USER}/${GITHUB_REPO_NAME}/issues`;

        const endpoints = [
            // Example endpoints from er-api.biz.id
            { title: "OpenRouter AI (Mistral)", service: "/ai/mistralai/mistral-7b-instruct:free", q: "t=Who are you?", method: "GET", categoryName: "AI Services" },
            { title: "Javascript Runner", service: "/get/run", q: "c=console.log('Hello World')&lang=javascript", method: "GET", categoryName: "Code Runners" },
            { title: "Tiktok Downloader", service: "/dl/tt", q: "u=https://vt.tiktok.com/ZSML4JTrb/", method: "GET", categoryName: "Downloaders" },
            
            // Common public websites for demo purposes
            { title: "Google.com", service: "https://www.google.com", q: "", method: "GET", categoryName: "Public Websites" },
            { title: "GitHub.com", service: "https://github.com", q: "", method: "GET", categoryName: "Public Websites" },
            { title: "Wikipedia.org", service: "https://www.wikipedia.org", q: "", method: "GET", categoryName: "Public Websites" },
            { title: "Cloudflare.com", service: "https://www.cloudflare.com", q: "", method: "GET", categoryName: "Public Websites" },
            { title: "Microsoft.com", service: "https://www.microsoft.com", q: "", method: "GET", categoryName: "Public Websites" },
            { title: "Apple.com", service: "https://www.apple.com", q: "", method: "GET", categoryName: "Public Websites" },
            { title: "Invalid URL (404 Test)", service: "https://www.example.com/non-existent-page-123", q: "", method: "GET", categoryName: "Test Endpoints" },
            { title: "Invalid Domain (Network Error Test)", service: "http://this-domain-does-not-exist-123456.com", q: "", method: "GET", categoryName: "Test Endpoints" }
        ].map(api => {
            let finalPath = api.service;
            // Ensure internal paths start with '/'
            if (!finalPath.startsWith('http://') && !finalPath.startsWith('https://') && !finalPath.startsWith('/')) {
                finalPath = `/${finalPath}`;
            }
            return {
                name: api.title,
                path: finalPath,
                params: api.q || "",
                method: api.method || 'GET',
                categoryName: api.categoryName 
            };
        });

        const categoriesContainer = document.getElementById('categoriesContainer');
        const refreshButton = document.getElementById('refreshButton');
        const lastUpdatedElement = document.getElementById('lastUpdated');
        const overallStatusBanner = document.getElementById('overallStatusBanner');
        const overallStatusIcon = document.getElementById('overallStatusIcon');
        const overallStatusText = document.getElementById('overallStatusText');
        const overallStatusCounts = document.getElementById('overallStatusCounts');

        const loadMoreButtonGlobal = document.getElementById('loadMoreButtonGlobal');
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        const aiModal = document.getElementById('aiModal');
        const aiModalTitle = document.getElementById('aiModalTitle');
        const aiLanguageSelectionDiv = document.getElementById('aiLanguageSelection');
        const langIdButton = document.getElementById('langIdButton');
        const langEnButton = document.getElementById('langEnButton');
        const aiResponseContent = document.getElementById('aiResponseContent');
        const closeAiModalButton = document.getElementById('closeAiModal');
        const closeAiModalBottomButton = document.getElementById('closeAiModalBottom');
        const copyAiResponseButton = document.getElementById('copyAiResponseButton');
        const copyBuffer = document.getElementById('copyBuffer');

        const ITEMS_PER_PAGE = 5; 
        let allProcessedEndpointData = []; 
        let numCurrentlyVisibleGlobalEndpoints = 0;

        let totalEndpointsCount = endpoints.length; 
        let operationalEndpointsCounter = 0; 
        let checkedEndpointsCounter = 0; 
        let hasCriticalErrorFlag = false; 
        
        let currentAiRequestData = null; 
        let autoRefreshIntervalId = null;

        function renderVisibleEndpoints() {
            categoriesContainer.innerHTML = ''; 

            const uniqueCategories = [...new Set(allProcessedEndpointData.map(item => item.endpoint.categoryName))];
            
            let displayedCount = 0;

            uniqueCategories.forEach(categoryName => {
                const categoryCard = document.createElement('div');
                categoryCard.className = 'category-card';
                
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'category-header';
                categoryHeader.innerHTML = `<h3 class="category-title">${categoryName}</h3>`;
                categoryCard.appendChild(categoryHeader);

                const categoryBody = document.createElement('div');
                categoryBody.className = 'category-body';

                allProcessedEndpointData.forEach(item => {
                    if (item.endpoint.categoryName === categoryName && displayedCount < numCurrentlyVisibleGlobalEndpoints) {
                        categoryBody.appendChild(item.rowElement);
                        displayedCount++;
                    }
                });
                
                if (categoryBody.hasChildNodes()) { 
                    categoryCard.appendChild(categoryBody);
                    categoriesContainer.appendChild(categoryCard);
                }
            });


            if (numCurrentlyVisibleGlobalEndpoints >= allProcessedEndpointData.length) {
                loadMoreButtonGlobal.style.display = 'none';
            } else {
                loadMoreButtonGlobal.style.display = 'block'; 
                loadMoreButtonGlobal.disabled = false;
                loadMoreButtonGlobal.innerHTML = '<i class="fas fa-chevron-down mr-2"></i> Load More Endpoints';
            }
        }


        function handleLoadMoreGlobal() {
            loadMoreButtonGlobal.disabled = true;
            loadMoreButtonGlobal.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Loading...';

            setTimeout(() => {
                const nextBatchEnd = Math.min(numCurrentlyVisibleGlobalEndpoints + ITEMS_PER_PAGE, allProcessedEndpointData.length);
                numCurrentlyVisibleGlobalEndpoints = nextBatchEnd;
                renderVisibleEndpoints(); 
            }, 300); 
        }
        loadMoreButtonGlobal.addEventListener('click', handleLoadMoreGlobal);
        
        function openAiModalForLanguageSelection(type) { 
            currentAiRequestData.type = type; 
            if (type === 'error_help') {
                aiModalTitle.innerHTML = '<i class="fas fa-language mr-2" style="color: var(--accent-blue);"></i> Select Error Help Language';
            } else if (type === 'explanation') {
                aiModalTitle.innerHTML = '<i class="fas fa-language mr-2" style="color: var(--accent-blue);"></i> Select Endpoint Explanation Language';
            }
            aiLanguageSelectionDiv.style.display = 'block';
            aiResponseContent.innerHTML = ''; 
            copyAiResponseButton.style.display = 'none'; 

            aiModal.classList.remove('opacity-0', 'pointer-events-none');
            aiModal.querySelector('.modal-content').classList.remove('scale-95');
            aiModal.querySelector('.modal-content').classList.add('scale-100');
        }

        function closeAiModal() {
            aiModal.querySelector('.modal-content').classList.remove('scale-100');
            aiModal.querySelector('.modal-content').classList.add('scale-95');
            aiModal.classList.add('opacity-0');
            setTimeout(() => {
                aiModal.classList.add('pointer-events-none');
            }, 250);
        }
        
        closeAiModalButton.addEventListener('click', closeAiModal);
        closeAiModalBottomButton.addEventListener('click', closeAiModal);
        aiModal.addEventListener('click', (event) => { 
            if (event.target === aiModal) {
                closeAiModal();
            }
        });

        copyAiResponseButton.addEventListener('click', () => {
            const textToCopy = aiResponseContent.innerText || aiResponseContent.textContent;
            copyBuffer.value = textToCopy;
            copyBuffer.select();
            try {
                document.execCommand('copy');
                copyAiResponseButton.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';
                setTimeout(() => {
                    copyAiResponseButton.innerHTML = '<i class="fas fa-copy mr-1"></i> Copy Info';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                copyAiResponseButton.innerText = 'Failed to Copy';
                 setTimeout(() => {
                    copyAiResponseButton.innerHTML = '<i class="fas fa-copy mr-1"></i> Copy Info';
                }, 2000);
            }
            copyBuffer.value = ""; 
        });
        
        async function callGeminiApi(prompt, language) {
            aiLanguageSelectionDiv.style.display = 'none'; 
            if (currentAiRequestData.type === 'error_help') {
                aiModalTitle.innerHTML = '<i class="fas fa-lightbulb mr-2" style="color: var(--accent-yellow);"></i> AI Error Help';
            } else if (currentAiRequestData.type === 'explanation') {
                aiModalTitle.innerHTML = '<i class="fas fa-info-circle mr-2" style="color: var(--accent-blue);"></i> Endpoint Explanation';
            }
            aiResponseContent.innerHTML = `<div class="flex items-center justify-center p-6"><i class="fas fa-spinner fa-spin fa-2x mr-3" style="color: var(--accent-blue);"></i> Analyzing with AI (${language.toUpperCase()})... Please wait.</div>`;
            copyAiResponseButton.style.display = 'none';
            copyAiResponseButton.disabled = true;

            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const geminiApiKey = ""; // Keep this empty, Canvas will inject the key at runtime
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Gemini API Error Data:", errorData);
                    throw new Error(`Gemini API request failed with status ${response.status}: ${errorData?.error?.message || response.statusText}`);
                }

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    let text = result.candidates[0].content.parts[0].text;
                    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); 
                    text = text.replace(/^- (.*$)/gm, '<li>$1</li>'); 
                    text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
                    text = text.replace(/<\/ul>\s*<ul>/g, ''); 
                    text = text.replace(/\n/g, '<br>'); 
                    aiResponseContent.innerHTML = `<div class="ai-suggestion-content p-2">${text}</div>`;
                    copyAiResponseButton.style.display = 'inline-block';
                    copyAiResponseButton.disabled = false;
                } else {
                    aiResponseContent.textContent = "No suggestions received from AI or response format is unexpected.";
                    console.warn("Gemini API response structure unexpected:", result);
                }
            } catch (error) {
                console.error("Error calling Gemini API:", error);
                aiResponseContent.innerHTML = `
                  <p style="color: var(--accent-red);">Please don't forget to add GEMINI APIKEY first.</p>
                  <p class="text-xs mt-2">Detail: ${error.message}</p>
                  <p><a href="https://github.com/erbots/status-page-with-gemini" target="_blank">See More</a></p>
                `;
            }
        }


        langIdButton.addEventListener('click', () => {
            if (currentAiRequestData) {
                const { name, path, error, type } = currentAiRequestData;
                const langInstruction = "Pastikan responsnya dalam bahasa Indonesia.";
                let prompt;
                if (type === 'error_help') {
                    prompt = `API endpoint bernama '${name}' (dengan path '${path}') pada layanan er-api.biz.id sedang mengalami masalah. Status yang terdeteksi adalah: '${error}'. Berikan penjelasan singkat yang mudah dipahami pengguna awam (non-teknis) mengenai kemungkinan penyebab umum masalah ini. Sertakan juga 2-3 saran langkah-langkah umum yang bisa dicoba pengguna untuk mengatasi atau mendapatkan informasi lebih lanjut. Fokus pada saran untuk pengguna, bukan untuk pemilik API. Hindari jargon teknis yang berlebihan. Gunakan format poin-poin (markdown-style) untuk saran. ${langInstruction}`;
                } else if (type === 'explanation') {
                    prompt = `Jelaskan fungsi dan kemungkinan penggunaan dari API endpoint bernama '${name}' dengan path '${path}' pada layanan er-api.biz.id. Fokus pada apa yang dilakukan endpoint ini jika berhasil (misalnya, status 200 OK), contoh data yang mungkin dikembalikan, atau tindakan yang dilakukan. Berikan penjelasan yang ramah pengguna dan hindari jargon teknis berlebihan. Jika relevan, berikan contoh kasus penggunaan dan format data yang diharapkan jika POST/PUT. ${langInstruction}`;
                }
                if (prompt) callGeminiApi(prompt, 'id');
                langIdButton.classList.add('active');
                langEnButton.classList.remove('active');
            }
        });
        langEnButton.addEventListener('click', () => {
            if (currentAiRequestData) {
                const { name, path, error, type } = currentAiRequestData;
                const langInstruction = "Ensure the response is in English.";
                let prompt;
                if (type === 'error_help') {
                    prompt = `The API endpoint named '${name}' (with path '${path}') on the er-api.biz.id service is experiencing an issue. The detected status is: '${error}'. Provide a brief explanation, easily understandable by a non-technical user, about common potential causes for this issue. Also, include 2-3 general troubleshooting steps the user can try or ways to get more information. Focus on advice for the end-user of the status page, not the API owner. Avoid excessive technical jargon. Use bullet points (markdown-style) for suggestions. ${langInstruction}`;
                } else if (type === 'explanation') {
                     prompt = `Explain the purpose and potential usage of an API endpoint named '${name}' with path '${path}' on the er-api.biz.id service. Focus on what this endpoint does upon a successful response (e.g., status 200 OK), what kind of data it might return, or the action it performs. Provide a user-friendly explanation and avoid excessive technical jargon. If relevant, provide example use cases and the expected data format if it's a POST/PUT request. ${langInstruction}`;
                }
                if (prompt) callGeminiApi(prompt, 'en');
                langEnButton.classList.add('active');
                langIdButton.classList.remove('active');
            }
        });
        
        async function checkEndpointAndCreateRow(endpoint) {
            const rowElement = document.createElement('div'); 
            rowElement.className = 'endpoint-item';

            rowElement.innerHTML = `
                <div class="endpoint-info">
                    <span class="endpoint-path table-cell-truncate" title="${endpoint.name} - ${endpoint.path}${endpoint.params ? '?' + endpoint.params : ''}">${endpoint.path}${endpoint.params ? '?' + endpoint.params : ''}</span>
                    <span class="endpoint-name-subtext">${endpoint.name}</span>
                </div>
                <div class="endpoint-status-badge-container"><span class="status-badge status-checking"><i class="fas fa-spinner fa-spin mr-1"></i>Checking</span></div>
                <span class="endpoint-code text-center">-</span>
                <span class="endpoint-time text-right">-</span>
                <div class="endpoint-actions"></div> 
            `;
            
            const statusBadgeContainer = rowElement.querySelector('.endpoint-status-badge-container');
            const statusCodeElement = rowElement.querySelector('.endpoint-code');
            const responseTimeElement = rowElement.querySelector('.endpoint-time');
            const actionContainer = rowElement.querySelector('.endpoint-actions');


            const explainButton = document.createElement('button');
            explainButton.className = 'action-button action-button-explain explain-endpoint-button';
            explainButton.title = 'Explain this Endpoint';
            explainButton.innerHTML = '✨ Info'; 
            explainButton.type = 'button'; 
            explainButton.dataset.endpointName = endpoint.name;
            explainButton.dataset.endpointPath = `${endpoint.path}${endpoint.params ? '?' + endpoint.params : ''}`; 
            actionContainer.appendChild(explainButton);


            let fullUrl;
            if (endpoint.path.startsWith('http://') || endpoint.path.startsWith('https://')) {
                fullUrl = `${endpoint.path}${endpoint.params ? '?' + endpoint.params : ''}`;
            } else {
                fullUrl = `${API_BASE_URL}${endpoint.path}${endpoint.params ? '?' + endpoint.params : ''}`;
            }

            const startTime = performance.now();
            let errorForAiHelp = ""; 

            try {
                const fetchOptions = {
                    method: endpoint.method || 'GET',
                    mode: 'cors',
                    signal: AbortSignal.timeout(20000) 
                };
                if ((endpoint.method === 'POST' || endpoint.method === 'PUT') && endpoint.body) {
                    fetchOptions.headers = { 'Content-Type': 'application/json' };
                    fetchOptions.body = typeof endpoint.body === 'string' ? endpoint.body : JSON.stringify(endpoint.body);
                }

                const response = await fetch(fullUrl, fetchOptions);
                const endTime = performance.now();
                const responseTime = Math.round(endTime - startTime);

                statusCodeElement.innerHTML = `<span class="font-medium text-sm ${response.ok ? 'text-slate-300' : 'text-red-400'}">${response.status}</span>`;
                responseTimeElement.innerHTML = `<span class="text-sm text-slate-300">${responseTime} ms</span>`;

                let statusClass = ''; let statusText = ''; let icon = '';

                if (response.ok) {
                    statusClass = 'status-ok'; statusText = 'Online'; icon = '<i class="fas fa-check-circle mr-1"></i>';
                    operationalEndpointsCounter++;
                } else if (response.status === 404) {
                    statusClass = 'status-warning'; statusText = 'Not Found'; icon = '<i class="fas fa-exclamation-triangle mr-1"></i>';
                    errorForAiHelp = `Error ${response.status} (Not Found)`;
                } else {
                    statusClass = 'status-error'; statusText = `Error`; icon = '<i class="fas fa-times-circle mr-1"></i>';
                    errorForAiHelp = `Error ${response.status} (${response.statusText || 'Unknown Status'})`;
                    if (response.status >= 500) hasCriticalErrorFlag = true;
                }
                statusBadgeContainer.innerHTML = `<span class="status-badge ${statusClass}">${icon}${statusText}</span>`;

                if (!response.ok) {
                    const issueTitle = `[Status Page] Issue: ${endpoint.name} (${response.status})`;
                    const issueBody = `**Endpoint:** ${fullUrl}\n**Detected Status:** ${response.status}\n\n**Problem Description (please complete):**\n\n**Timestamp:** ${new Date().toISOString()}`;
                    const githubIssueUrl = `https://github.com/${GITHUB_REPO_USER}/${GITHUB_REPO_NAME}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=bug,status-page`;
                    
                    const aiHelpButton = document.createElement('button');
                    aiHelpButton.className = 'action-button action-button-ai ai-error-help-button'; 
                    aiHelpButton.title = 'Get AI Help for Error';
                    aiHelpButton.innerHTML = '❓ AI Error'; 
                    aiHelpButton.type = 'button'; 
                    aiHelpButton.dataset.endpointName = endpoint.name;
                    aiHelpButton.dataset.endpointPath = fullUrl; 
                    aiHelpButton.dataset.errorDetails = errorForAiHelp;
                    actionContainer.appendChild(aiHelpButton);

                    const reportLink = document.createElement('a');
                    reportLink.href = githubIssueUrl;
                    reportLink.target = '_blank';
                    reportLink.rel = 'noopener noreferrer';
                    reportLink.className = 'action-button action-button-report';
                    reportLink.title = `Report Issue: ${response.statusText || ''}`;
                    reportLink.innerHTML = '<i class="fas fa-bug"></i> Report';
                    actionContainer.appendChild(reportLink);
                }

            } catch (error) {
                const endTime = performance.now();
                responseTimeElement.innerHTML = `<span class="text-sm text-slate-400">${Math.round(endTime - startTime)} ms</span>`;
                let errorMsg = 'Offline';
                let detailedErrorCause = `Error: ${error.message}. Check browser console for details.`;

                if (error.name === 'TimeoutError') { errorMsg = 'Timeout'; detailedErrorCause = 'Request to server exceeded 20 seconds timeout.';
                } else if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) { errorMsg = 'Network/CORS'; detailedErrorCause = 'Failed to fetch data. Possible causes: CORS issue, server unreachable, DNS, or SSL. Check browser console (Network Tab).';
                } else { detailedErrorCause = error.message || "Unknown error"; }
                errorForAiHelp = `${errorMsg} (${detailedErrorCause})`;

                statusBadgeContainer.innerHTML = `<span class="status-badge status-error" title="${detailedErrorCause}"><i class="fas fa-plug-circle-xmark mr-1"></i>${errorMsg}</span>`;
                statusCodeElement.innerHTML = `<span class="font-medium text-sm" style="color: var(--accent-red);">N/A</span>`;
                console.error(`[Status Page] Error checking ${fullUrl}:`, error);
                hasCriticalErrorFlag = true;

                const issueTitle = `[Status Page] Check Failure: ${endpoint.name}`;
                const issueBody = `**Endpoint:** ${fullUrl}\n**Detected Status:** ${errorMsg} / Unreachable\n**Error Message:** ${error.message}\n**Possible Details:** ${detailedErrorCause}\n\n**Timestamp:** ${new Date().toISOString()}`;
                const githubIssueUrl = `https://github.com/${GITHUB_REPO_USER}/${GITHUB_REPO_NAME}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=bug,status-page,critical`;
                
                const aiHelpButton = document.createElement('button');
                aiHelpButton.className = 'action-button action-button-ai ai-error-help-button';
                aiHelpButton.title = 'Get AI Help for Error';
                aiHelpButton.innerHTML = 'Why ❓';
                aiHelpButton.type = 'button';
                aiHelpButton.dataset.endpointName = endpoint.name;
                aiHelpButton.dataset.endpointPath = fullUrl;
                aiHelpButton.dataset.errorDetails = errorForAiHelp;
                actionContainer.appendChild(aiHelpButton);

                const reportLink = document.createElement('a');
                reportLink.href = githubIssueUrl;
                reportLink.target = '_blank';
                reportLink.rel = 'noopener noreferrer';
                reportLink.className = 'action-button action-button-report';
                reportLink.title = `Report Issue: ${errorMsg}`;
                reportLink.innerHTML = '<i class="fas fa-bug"></i> Report';
                actionContainer.appendChild(reportLink);
            } finally {
                checkedEndpointsCounter++;
                updateOverallStatusDisplay();
            }
            return { endpoint, rowElement }; 
        }

        categoriesContainer.addEventListener('click', function(event) { 
            const errorHelpButton = event.target.closest('.ai-error-help-button');
            const explainButton = event.target.closest('.explain-endpoint-button');

            if (errorHelpButton) {
                currentAiRequestData = { 
                    name: errorHelpButton.dataset.endpointName,
                    path: errorHelpButton.dataset.endpointPath,
                    error: errorHelpButton.dataset.errorDetails,
                };
                openAiModalForLanguageSelection('error_help'); 
            } else if (explainButton) {
                 currentAiRequestData = { 
                    name: explainButton.dataset.endpointName,
                    path: explainButton.dataset.endpointPath, 
                };
                openAiModalForLanguageSelection('explanation');
            }
        });

        async function loadAllEndpoints(isAutoRefresh = false) {
            if (!isAutoRefresh) { 
                categoriesContainer.innerHTML = ''; 
                allProcessedEndpointData = [];
                numCurrentlyVisibleGlobalEndpoints = 0;
                loadMoreButtonGlobal.style.display = 'none';
                loadMoreButtonGlobal.disabled = true;
                loadMoreButtonGlobal.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Loading...';
            }
            
            operationalEndpointsCounter = 0;
            checkedEndpointsCounter = 0;
            hasCriticalErrorFlag = false;
            
            updateOverallStatusDisplay(); 
            lastUpdatedElement.textContent = isAutoRefresh ? `Auto-refreshing... (${new Date().toLocaleTimeString('en-US')})` : "Loading...";


            const dataCreationPromises = endpoints.map(endpoint => 
                checkEndpointAndCreateRow(endpoint) 
            );

            allProcessedEndpointData = await Promise.all(dataCreationPromises); 
            
            if (!isAutoRefresh) { 
                numCurrentlyVisibleGlobalEndpoints = Math.min(ITEMS_PER_PAGE, allProcessedEndpointData.length);
            }
            renderVisibleEndpoints(); 
            
            lastUpdatedElement.textContent = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'medium' });
            updateOverallStatusDisplay();
        }

        refreshButton.addEventListener('click', () => loadAllEndpoints(false));
        
        function startAutoRefresh() {
            if (autoRefreshIntervalId) clearInterval(autoRefreshIntervalId);
            autoRefreshIntervalId = setInterval(() => loadAllEndpoints(true), AUTO_REFRESH_INTERVAL);
            console.log(`Auto-refresh enabled. Interval: ${AUTO_REFRESH_INTERVAL / 1000} seconds.`);
        }

        document.addEventListener('DOMContentLoaded', () => {
            loadAllEndpoints(false);
            startAutoRefresh(); 
        });
        
        function updateOverallStatusDisplay() {
            overallStatusBanner.className = 'overall-status-banner p-6 mb-8 text-center'; 
            let bannerClass = 'overall-checking-banner';
            let iconHtml = `<i class="fas fa-spinner fa-spin" style="color: var(--accent-blue);"></i>`;
            let statusMsg = 'Checking System Status...';
            let countsMsg = '';

            if (totalEndpointsCount > 0 && checkedEndpointsCounter < totalEndpointsCount) { 
                countsMsg = `${checkedEndpointsCounter} of ${totalEndpointsCount} endpoints checked.`;
            } else if (totalEndpointsCount === 0) { 
                bannerClass = 'overall-warning-banner';
                iconHtml = `<i class="fas fa-info-circle" style="color: var(--accent-yellow);"></i>`;
                statusMsg = 'No Services Configured';
            }
            else if (hasCriticalErrorFlag) {
                bannerClass = 'overall-error-banner';
                iconHtml = `<i class="fas fa-times-circle" style="color: var(--accent-red);"></i>`;
                statusMsg = 'Severe System Outage';
                countsMsg = `${operationalEndpointsCounter} of ${totalEndpointsCount} services operational.`;
            } else if (operationalEndpointsCounter === totalEndpointsCount && totalEndpointsCount > 0) { 
                bannerClass = 'overall-ok-banner';
                iconHtml = `<i class="fas fa-check-circle" style="color: var(--accent-green);"></i>`;
                statusMsg = 'All Systems Operational';
                countsMsg = `All ${totalEndpointsCount} services operational.`;
            } else if (operationalEndpointsCounter > 0) {
                bannerClass = 'overall-warning-banner';
                iconHtml = `<i class="fas fa-exclamation-triangle" style="color: var(--accent-yellow);"></i>`;
                statusMsg = 'Some Services Experiencing Issues';
                countsMsg = `${operationalEndpointsCounter} of ${totalEndpointsCount} services operational.`;
            } else { 
                bannerClass = 'overall-error-banner';
                iconHtml = `<i class="fas fa-exclamation-circle" style="color: var(--accent-red);"></i>`;
                statusMsg = 'All Services Unreachable';
                countsMsg = `0 of ${totalEndpointsCount} services operational.`;
            }
            
            overallStatusBanner.classList.add(bannerClass);
            overallStatusIcon.innerHTML = iconHtml;
            overallStatusText.textContent = statusMsg;
            overallStatusCounts.textContent = countsMsg;
        }
