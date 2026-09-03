declare global{
    namespace Express{
        interface Request{
            userId?: string;
            log?: {
                error: (obj: object, msg: string) => void;
            };
        }
    }
}

export {};