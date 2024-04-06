import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback, Profile, } from 'passport-google-oauth2'


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ['profile', 'email']
        })
    }

    async validate(_access_token: string, refresh_token : string,  profile: Profile, done: VerifyCallback) {
        console.log(profile);
        const { emails, displayName } = profile
        if (_access_token) {
            const payload = {
                email: emails[0].value,
                username: displayName
            }
            done(null, payload)
        } else {
            done(null, null)
        }
    }

}