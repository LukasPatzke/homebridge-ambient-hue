
type hueError = {
    error: {
        type: number;
        address: string;
        description: string;
    };
};

export type hueErrorResponse = hueError[];