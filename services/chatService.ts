export const ChatService = {
    async uploadFile(file: File): Promise<{ url: string; filename: string }> {
        return {
            url: "",
            filename: file.name
        };
    }
};
