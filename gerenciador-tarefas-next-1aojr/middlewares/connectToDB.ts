import mongoose, { mongo } from 'mongoose'
import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next'
import { DefaultMessageResponse } from '../types/DefaultMessageResponse'

export const connectToDB = (handler: NextApiHandler) => 
async (resquest: NextApiRequest, response: NextApiResponse<DefaultMessageResponse>) => {
    
    console.log('Mongo está conectado:', mongoose.connections[0].readyState === 1 ? 'Sim' : 'Não')
    if(mongoose.connections[0].readyState){
        return handler(resquest, response);
    }

    const {DB_CONNECTION_STRING} = process.env;
    if (!DB_CONNECTION_STRING){
        return response.status(500).json({error: 'Env DB_CONNECTION_STRING não informada'});
    }

    mongoose.connection.on('conected', () => console.log('Conectado ao banco de dados'));
    mongoose.connection.on('error', () => console.log('Erro ao conectar no banco de dados'));
    await mongoose.connect(DB_CONNECTION_STRING);

    return handler(resquest, response);
}