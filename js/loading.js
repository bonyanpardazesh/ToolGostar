// Loading Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Loading messages that cycle through
    const loadingMessages = [
        "Initializing water treatment systems...",
        "Connecting to industrial networks...",
        "Loading mixer configurations...",
        "Preparing pump diagnostics...",
        "Calibrating filtration systems...",
        "Establishing secure connections...",
        "Loading ToolGostar solutions...",
        "Finalizing system setup..."
    ];
    
    let currentMessageIndex = 0;
    let progress = 0;
    let isLoading = true;
    
    const progressFill = document.querySelector('.progress-fill');
    const loadingPercentage = document.querySelector('.loading-percentage');
    const loadingMessage = document.getElementById('loadingMessage');
    
    
    // Function to update loading message with animation
    function updateLoadingMessage() {
        loadingMessage.style.opacity = '0';
        loadingMessage.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            loadingMessage.textContent = loadingMessages[currentMessageIndex];
            loadingMessage.style.opacity = '1';
            loadingMessage.style.transform = 'translateY(0px)';
        }, 300);
    }
    
    // Function to complete loading and redirect
    function completeLoading() {
        // Set session storage flag to indicate loading was completed
        sessionStorage.setItem('loadingCompleted', 'true');
        sessionStorage.setItem('fromLoading', 'true');
        
        // Add completion animation
        document.querySelector('.loading-container').style.animation = 'fadeOut 1s ease-in-out forwards';
        
        setTimeout(() => {
            // Redirect to home page or the intended destination
            window.location.href = 'home.html';
        }, 1000);
    }
    
    // Set total loading time to 3 seconds
    const totalLoadingTime = 3000; // 3 seconds
    const updateInterval = 50; // Update every 50ms for smoother animation
    const totalUpdates = totalLoadingTime / updateInterval;
    const progressPerUpdate = 100 / totalUpdates;
    
    // Start the loading simulation
    const loadingInterval = setInterval(() => {
        if (isLoading) {
            progress += progressPerUpdate;
            
            if (progress >= 100) {
                progress = 100;
                isLoading = false;
                
                // Complete loading after a short delay
                setTimeout(() => {
                    completeLoading();
                }, 300);
            }
            
            // Update progress bar and percentage
            progressFill.style.width = progress + '%';
            loadingPercentage.textContent = Math.round(progress) + '%';
            
            // Update loading message based on progress
            const messageIndex = Math.floor((progress / 100) * (loadingMessages.length - 1));
            if (messageIndex !== currentMessageIndex && messageIndex < loadingMessages.length) {
                currentMessageIndex = messageIndex;
                updateLoadingMessage();
            }
        } else {
            clearInterval(loadingInterval);
        }
    }, updateInterval);
    
    // Initialize first message
    updateLoadingMessage();
    
    // Add mouse click to skip loading (for testing)
    document.addEventListener('click', function() {
        if (isLoading) {
            progress = 95;
            isLoading = false;
            progressFill.style.width = '100%';
            loadingPercentage.textContent = '100%';
            // Set session storage flags immediately when skipping
            sessionStorage.setItem('loadingCompleted', 'true');
            sessionStorage.setItem('fromLoading', 'true');
            setTimeout(() => {
                completeLoading();
            }, 300);
        }
    });
    
    // Add keyboard shortcut (Space or Enter) to skip loading
    document.addEventListener('keydown', function(e) {
        if ((e.code === 'Space' || e.code === 'Enter') && isLoading) {
            e.preventDefault();
            progress = 95;
            isLoading = false;
            progressFill.style.width = '100%';
            loadingPercentage.textContent = '100%';
            // Set session storage flags immediately when skipping
            sessionStorage.setItem('loadingCompleted', 'true');
            sessionStorage.setItem('fromLoading', 'true');
            setTimeout(() => {
                completeLoading();
            }, 300);
        }
    });
});

// Add fade-out animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.5;
            transform: scale(1.05);
        }
        100% {
            opacity: 0;
            transform: scale(1.1);
        }
    }
`;
document.head.appendChild(style);
