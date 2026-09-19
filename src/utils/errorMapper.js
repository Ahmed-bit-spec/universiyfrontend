/**
 * Maps backend error messages to translation keys
 * This allows errors from the backend to be displayed in the user's selected language
 */

export const mapBackendErrorToTranslationKey = (backendErrorMessage, defaultKey = 'generic') => {
    if (!backendErrorMessage || typeof backendErrorMessage !== 'string') {
        return defaultKey;
    }

    const msg = backendErrorMessage.toLowerCase();
    console.log("🔍 Mapping error:", msg);

    // Check for specific error patterns
    if (msg.includes('already have an active reservation')) {
        console.log("✅ Matched: alreadyHasReservation");
        return 'alreadyHasReservation';
    }

    if (msg.includes('already booked') && msg.includes('time')) {
        console.log("✅ Matched: seatConflict");
        return 'seatConflict';
    }

    if (msg.includes('invalid') && msg.includes('time')) {
        console.log("✅ Matched: invalidTime");
        return 'invalidTime';
    }

    if (msg.includes('past')) {
        console.log("✅ Matched: timePassed");
        return 'timePassed';
    }

    if (msg.includes('exceeds') && msg.includes('closing')) {
        console.log("✅ Matched: exceedsCloseTime");
        return 'exceedsCloseTime';
    }

    if (msg.includes('exceeds') && msg.includes('2')) {
        console.log("✅ Matched: exceeds2Hours");
        return 'exceeds2Hours';
    }

    if (msg.includes('girls') || msg.includes('female')) {
        console.log("✅ Matched: girlsZoneError");
        return 'girlsZoneError';
    }

    if (msg.includes('seat') && msg.includes('not found')) {
        console.log("✅ Matched: seatNotFound");
        return 'seatNotFound';
    }

    if (msg.includes('verify') || msg.includes('verification')) {
        console.log("✅ Matched: notVerified");
        return 'notVerified';
    }

    console.log("⚠️ No match found, using default:", defaultKey);
    return defaultKey;
};

/**
 * Get the translated error message from locale file
 * Usage: getTranslatedError(errorMessage, copy.errors, 'en')
 */
export const getTranslatedError = (backendErrorMessage, errorsObj, language = 'en') => {
    console.log("📦 errorsObj available:", !!errorsObj);

    if (!errorsObj) {
        console.warn("⚠️ errorsObj is undefined, returning backend message");
        return backendErrorMessage;
    }

    const key = mapBackendErrorToTranslationKey(backendErrorMessage);
    const translation = errorsObj[key] || errorsObj.generic || backendErrorMessage;

    console.log(`📍 Looking for key: "${key}"`);
    console.log(`📍 Found translation: "${translation}"`);

    return translation;
};
