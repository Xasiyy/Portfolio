import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type CreateSandboxResult = { sandboxId: string; port: string };

//cette methode appelle POST /sandboxes sur dansbox-runner en imposant un delai maximal de 2 min
// et transforme toute erreur reseau ou HTTP en une HttpException Nest propre plutot que de laisser fuiter une erreur brute
@Injectable()
export class SandboxService { 
    constructor(private readonly config: ConfigService) {}

    async createSandbox(repoUrl: string): Promise<CreateSandboxResult> {
        const baseUrl = this.config.get<string>('SANDBOX_RUNNER_URL');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 200_000);

        try {
            const response = await fetch(`${baseUrl}/sandboxes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-runner-key': this.config.get<string>('RUNNER_API_KEY')!,
                },
                body: JSON.stringify({ repoUrl }),
                signal: controller.signal,
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                const status = response.status === 503 ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.BAD_GATEWAY;
                throw new HttpException(body.error ?? 'Sandbox runner error', status);
            }
            return (await response.json()) as CreateSandboxResult;
        }
        catch (err) {
            if (err instanceof HttpException) throw err;
            if ((err as Error).name === 'AbortError') {
                throw new HttpException('Sandbox creation timed out', HttpStatus.GATEWAY_TIMEOUT);
            }
            throw new HttpException('Sandbox runner unreachablle', HttpStatus.BAD_GATEWAY);
        }
        finally {
            clearTimeout(timeout);
        }
    }
}