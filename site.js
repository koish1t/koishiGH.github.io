const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
    document.body.classList.add('mobile');
}

document.addEventListener('DOMContentLoaded', function() {
    const video = document.querySelector('.bg-video');
    const muteButton = document.getElementById('muteButton');
    
    video.muted = true;
    
    video.play().catch(function(error) {
        console.log("Video play failed:", error);
    });

    muteButton.addEventListener('click', function() {
        video.muted = !video.muted;
        muteButton.querySelector('img').style.opacity = video.muted ? '0.5' : '1';
        
        if (!video.muted) {
            video.play().catch(function(error) {
                console.log("Video play failed:", error);
                video.muted = true;
                muteButton.querySelector('img').style.opacity = '0.5';
            });
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const message = document.getElementById('message').value;
        
        const bannedWords = [
            'nigger', 'nigga', 'racist', 'slur', 'hate', 'colored people', 'fag', 'faggot', 'retard' // truly the filter ever :D, also i'm not racist nor homophobic or anything else, I fw everyone and every race, gender, sexuality, etc.
        ];
        
        const containsBannedWord = bannedWords.some(word => 
            message.toLowerCase().includes(word.toLowerCase())
        );
        
        if (containsBannedWord) {
            alert('Message contains inappropriate content and cannot be sent.');
            return;
        }
        
        const p1 = 'discord.com/api';
        const p2 = '/webhooks/';
        const p3 = '1313279684791767111';
        const p4 = 'z3wQJbjFFEt8eL56BsOo1hnvUVPw-VKk2DkdJLyFreBmV1nz0-Jfv0WTSL7zPNJXxtZ5';
        
        const webhookURL = `https://${p1}${p2}${p3}/${p4}`;

        // if ur reading this, PLEASE DO NOT send random shit to this webhook

        try {
            const response = await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: `<@&1220820325915299971> New message: ${message}`
                })
            });

            if (response.ok) {
                alert('Message sent!');
                contactForm.reset();
            } else {
                alert('Failed to send message.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to send message.');
        }
    });
});
