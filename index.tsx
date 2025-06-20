/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('App loaded.');

    const appContainer = document.getElementById('app-container') as HTMLElement | null;
    const mapViewScreen = document.getElementById('map-view-screen') as HTMLElement | null;

    const verifyButton = document.querySelector('.verify-button') as HTMLButtonElement | null;
    const swipeTrack = document.getElementById('swipeTrack') as HTMLDivElement | null;
    const verificationBanner = document.querySelector('.verification-banner') as HTMLDivElement | null;
    const orderEtaElement = document.querySelector('.order-eta') as HTMLParagraphElement | null;
    const detailsArrowIcon = document.querySelector('.order-card .details-arrow-icon') as HTMLDivElement | null;
    const verifiedCheckmarkIcon = document.querySelector('.verified-checkmark-icon') as HTMLDivElement | null;
    const orderCard = document.querySelector('.order-card') as HTMLElement | null;
    const helpSupportSection = document.getElementById('helpSupportSection') as HTMLElement | null;
    const orderVerificationDivider = document.getElementById('orderVerificationDivider') as HTMLDivElement | null;
    const contentFooterDivider = document.getElementById('contentFooterDivider') as HTMLDivElement | null;

    const swipeHandle = document.getElementById('swipeHandle') as HTMLDivElement | null;
    const swipeTextBaseLayer = document.getElementById('swipeTextBaseLayer') as HTMLElement | null;
    const swipeProgressFill = document.getElementById('swipeProgressFill') as HTMLDivElement | null;
    const swipeTextOverlayLayer = document.getElementById('swipeTextOverlayLayer') as HTMLElement | null;

    // Confirmation Modal Elements
    const confirmationModalOverlay = document.getElementById('confirmationModalOverlay') as HTMLDivElement | null;
    const confirmationModal = document.getElementById('confirmationModal') as HTMLDivElement | null; 
    const confirmContinueButton = document.getElementById('confirmContinueButton') as HTMLButtonElement | null;
    const confirmGoBackButton = document.getElementById('confirmGoBackButton') as HTMLButtonElement | null;

    const arrowIconSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"/></svg>`;
    
    let isDragging = false;
    let startX = 0;
    let offsetX = 0;
    let isSwipeCompleted = false;
    let trackPaddingLeft = 0;
    let trackPaddingRight = 0;
    let cachedHandleWidth = 0;


    const showConfirmationModal = () => {
        if (confirmationModalOverlay && confirmationModal) {
            confirmationModalOverlay.style.display = 'flex';
            confirmationModalOverlay.setAttribute('aria-hidden', 'false');
            // Force reflow to ensure the transition is applied
            void confirmationModal.offsetHeight; 
            confirmationModal.style.transform = 'translateY(0)';
        }
    };

    const hideConfirmationModal = () => {
        if (confirmationModalOverlay && confirmationModal) {
            confirmationModal.style.transform = 'translateY(100%)';
            
            const handleTransitionEnd = () => {
                confirmationModalOverlay.style.display = 'none';
                confirmationModalOverlay.setAttribute('aria-hidden', 'true');
                if(confirmationModal) { // Check if modal still exists
                    confirmationModal.removeEventListener('transitionend', handleTransitionEnd);
                }
            };
            confirmationModal.addEventListener('transitionend', handleTransitionEnd, { once: true });
        }
    };

    const resetSwipeToActive = () => {
        if (!swipeTrack || !swipeHandle || !swipeTextBaseLayer || !swipeProgressFill || !swipeTextOverlayLayer) return;

        isSwipeCompleted = false;
        offsetX = 0;
        
        swipeHandle.innerHTML = arrowIconSVG;
        swipeHandle.style.transform = 'translateX(0px)';
        
        swipeTrack.classList.remove('is-completed', 'is-disabled');
        swipeTrack.classList.add('is-active');
        swipeTrack.setAttribute('aria-disabled', 'false');
        swipeTrack.setAttribute('aria-label', 'Recolección completada (deslizar para activar)');
        swipeTrack.setAttribute('tabindex', '0');
        
        swipeTextBaseLayer.textContent = 'Recolección completada';
        swipeTextOverlayLayer.textContent = 'Recolección completada';
        
        const trackContentWidth = swipeTrack.clientWidth - (trackPaddingLeft + trackPaddingRight);
        swipeTextOverlayLayer.style.width = `${trackContentWidth}px`;
        
        const handleHalfWidth = cachedHandleWidth / 2;
        swipeProgressFill.style.width = `${handleHalfWidth}px`;
    };


    if (verifyButton && swipeTrack && orderCard && swipeHandle && swipeTextBaseLayer && swipeProgressFill && swipeTextOverlayLayer) {
        const computedTrackStyle = getComputedStyle(swipeTrack);
        trackPaddingLeft = parseFloat(computedTrackStyle.paddingLeft) || 0;
        trackPaddingRight = parseFloat(computedTrackStyle.paddingRight) || 0;
        cachedHandleWidth = swipeHandle.offsetWidth;

        verifyButton.addEventListener('click', () => {
            console.log('Botón "Verifica este pedido" presionado.');

            if (verificationBanner) verificationBanner.style.display = 'none';
            if (orderEtaElement) orderEtaElement.style.display = 'none';
            if (detailsArrowIcon) detailsArrowIcon.style.display = 'none';
            if (verifiedCheckmarkIcon) verifiedCheckmarkIcon.style.display = 'flex';
            if (verifyButton) verifyButton.style.display = 'none';
            if (orderCard) orderCard.classList.add('is-verified');
            if (orderVerificationDivider) orderVerificationDivider.style.display = 'block';
            if (helpSupportSection) helpSupportSection.style.display = 'block';
            if (contentFooterDivider) contentFooterDivider.classList.add('large-empty-block');
            
            resetSwipeToActive(); // Initialize swipe to active state
        });
    }

    const startDrag = (clientX: number) => {
        if (!swipeTrack || swipeTrack.classList.contains('is-disabled') || isSwipeCompleted || !swipeHandle || !swipeProgressFill) return;
        isDragging = true;
        startX = clientX - offsetX; 
        
        swipeHandle.style.transition = 'none';
        swipeProgressFill.style.transition = 'none';
        if(swipeTrack) swipeTrack.style.cursor = 'grabbing';
        console.log('Swipe started');
    };

    const drag = (clientX: number) => {
        if (!isDragging || !swipeTrack || !swipeHandle || !swipeProgressFill) return;

        const currentOffsetX = clientX - startX;
        const maxTranslateX = swipeTrack.clientWidth - trackPaddingLeft - trackPaddingRight - cachedHandleWidth;

        offsetX = Math.max(0, currentOffsetX); 
        offsetX = Math.min(offsetX, maxTranslateX); 

        swipeHandle.style.transform = `translateX(${offsetX}px)`;

        const handleHalfWidth = cachedHandleWidth / 2;
        const fillWidth = offsetX + handleHalfWidth;
        swipeProgressFill.style.width = `${fillWidth}px`;
    };

    const endDrag = () => {
        if (!isDragging || !swipeTrack || !swipeHandle || !swipeTextBaseLayer || !swipeProgressFill || !swipeTextOverlayLayer) return;
        
        isDragging = false;
        swipeHandle.style.transition = 'transform 0.2s ease, background-color 0.3s ease, fill 0.3s ease';
        swipeProgressFill.style.transition = 'width 0.2s ease';

        if(swipeTrack) swipeTrack.style.cursor = 'grab';

        const maxTranslateX = swipeTrack.clientWidth - trackPaddingLeft - trackPaddingRight - cachedHandleWidth;
        const threshold = maxTranslateX * 0.8; 

        if (offsetX >= threshold) {
            console.log('Swipe threshold reached, showing confirmation modal.');
            offsetX = maxTranslateX; 
            swipeHandle.style.transform = `translateX(${offsetX}px)`;
            
            const handleHalfWidth = cachedHandleWidth / 2;
            swipeProgressFill.style.width = `${offsetX + handleHalfWidth}px`;
            
            swipeTrack.setAttribute('aria-disabled', 'true'); 
            swipeTrack.setAttribute('aria-label', 'Recolección completada, esperando confirmación'); 

            isSwipeCompleted = true; 
            showConfirmationModal(); 
        } else {
            console.log('Deslizamiento cancelado.');
            offsetX = 0;
            swipeHandle.style.transform = 'translateX(0px)';
            
            const handleHalfWidth = cachedHandleWidth / 2;
            swipeProgressFill.style.width = `${handleHalfWidth}px`; 
        }
    };

    if (swipeTrack && swipeHandle) {
        if (swipeTrack.classList.contains('is-disabled')) {
            swipeTrack.setAttribute('aria-disabled', 'true');
            swipeTrack.setAttribute('tabindex', '-1');
             if (swipeHandle) swipeHandle.innerHTML = arrowIconSVG; 
        } else {
            swipeTrack.setAttribute('aria-disabled', 'false');
            swipeTrack.setAttribute('tabindex', '0');
        }

        swipeHandle.addEventListener('mousedown', (e) => {
            if (swipeTrack.classList.contains('is-active') && !isSwipeCompleted) {
                startDrag(e.clientX);
            }
        });

        swipeHandle.addEventListener('touchstart', (e) => {
            if (swipeTrack.classList.contains('is-active') && !isSwipeCompleted && e.touches[0]) {
                 startDrag(e.touches[0].clientX);
            }
        }, { passive: true });


        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                drag(e.clientX);
            }
        });
        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches[0]) {
                drag(e.touches[0].clientX);
            }
        }, { passive: false }); 

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                endDrag();
            }
        });
        document.addEventListener('touchend', () => {
             if (isDragging) {
                endDrag();
            }
        });
    }

    // Modal button event listeners
    if (confirmContinueButton) {
        confirmContinueButton.addEventListener('click', () => {
            console.log('Confirmado: Continuar con el siguiente destino.');
            hideConfirmationModal();
            
            if (appContainer && mapViewScreen) {
                // 1. Make the map-view-screen part of the layout but still transparent
                mapViewScreen.style.display = 'flex';
                // Force reflow to ensure display:flex and opacity:0 are applied before transitions start
                void mapViewScreen.offsetHeight; 

                // 2. Start fading out the current app container
                appContainer.style.opacity = '0';

                // 3. Start fading in the new map view screen
                // This will happen concurrently with appContainer fading out
                mapViewScreen.style.opacity = '1';

                // 4. After appContainer has faded out, set its display to none
                const appContainerFadeOutHandler = () => {
                    if (appContainer) { // Check if element still exists
                        appContainer.style.display = 'none';
                    }
                };
                appContainer.addEventListener('transitionend', appContainerFadeOutHandler, { once: true });
            }
        });
    }

    if (confirmGoBackButton) {
        confirmGoBackButton.addEventListener('click', () => {
            console.log('Confirmación cancelada: Regresar.');
            hideConfirmationModal();
            resetSwipeToActive(); // Reset swipe control to active state
        });
    }

});