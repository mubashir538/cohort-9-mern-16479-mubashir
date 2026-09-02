export async function runAsync<T>(work: Promise<T>): Promise<T> {
    try {
        return await work;
    } catch (err) {
        throw err;
    }
}
