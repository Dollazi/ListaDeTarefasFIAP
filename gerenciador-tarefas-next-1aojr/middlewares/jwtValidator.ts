import jwt, { JwtPayload } from 'jsonwebtoken';
import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next'
import { DefaultMessageResponse } from '../types/DefaultMessageResponse'

export const jwtValidator = (handler: NextApiHandler) => 
async (resquest: NextApiRequest, response: NextApiResponse<DefaultMessageResponse>) => {
    

    const {MY_SECRET_KEY} = process.env;
    if (!MY_SECRET_KEY){
        return response.status(500).json({error: 'Env MY_SECRET_KEY não informada'});
    }

    if(!resquest || !resquest.headers){
        return response.status(401).json({error: 'Não foi possível validar token de acesso!'});
    }

    if(resquest.method !== 'OPTIONS'){
        const authorization = resquest.headers['authorization'];

        if(!authorization){
            return response.status(401).json({error: 'Não foi possível validar token de acesso!'});
        }

        const token = authorization.substring(7);

        if(!token){
            return response.status(401).json({error: 'Não foi possível validar token de acesso!'});
        }

        try{
            const decoded = jwt.verify(token, MY_SECRET_KEY) as JwtPayload;
            if(!decoded){
                return response.status(401).json({error: 'Não foi possível validar token de acesso!'});
            } 

            if(resquest.body){
                resquest.body.userId = decoded._id;
            }else if(resquest.query){
                resquest.query.userId = decoded._id;
            }            
        }catch(e){
            console.log('Não foi possível validar token de acesso:', e);
            return response.status(500).json({error: 'Não foi possível validar token de acesso!'});
        }
    }


    return handler(resquest, response);
}