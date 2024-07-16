import { I_SessionRepo, SessionRepoInputType } from "../../interface/I_session.repo";

export class SessionRepo implements I_SessionRepo{
    findSession(sessionId: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    createSession(data: SessionRepoInputType): Promise<any> {
        throw new Error("Method not implemented.");
    }
}