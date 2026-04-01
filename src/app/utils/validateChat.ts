export function validateChat(data: any) {
    if (!data || typeof data !== "object" || !data.travelId?.trim() || !data.userId?.trim() || !data.message?.trim()) {
        return {
            validated: false, message: "Invalid chat data. 'travelId', 'userId', and 'message' are required and must be non-empty strings."
        };
    }
    return { validated: true };
}
