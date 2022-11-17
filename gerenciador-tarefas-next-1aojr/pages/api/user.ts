import type { NextApiRequest, NextApiResponse } from 'next'
import { use } from 'react';
import { json } from 'stream/consumers';
import { connectToDB } from '../../middlewares/connectToDB';
import { UserModel } from '../../models/User';
import { DefaultMessageResponse } from '../../types/DefaultMessageResponse';
import { User } from '../../types/User';
import CryptoJS from "crypto-js";

const endpoint = async (requisicao: NextApiRequest, resposta: NextApiResponse<DefaultMessageResponse>) => {

    try {

        if (requisicao.method !== 'POST') {
            return resposta.status(405).json({ error: 'Método informado não existe' });
        }

        const {MY_SECRET_KEY} = process.env;

        if (!MY_SECRET_KEY){
            return resposta.status(500).json({error: 'Env MY_SECRET_KEY não informada'});
        }

        if (!requisicao.body) {
            return resposta.status(400).json({ error: 'Favor informar os dados para autenticação' });
        }

        const user = requisicao.body as User;
        
        if(!user.name || user.name.length < 2){
            return resposta.status(400).json({ error: 'Nome não é válido' });
        }

        if(!user.email || user.email.length < 6){
            return resposta.status(400).json({ error: 'E-mail não é válido' });
        }

        if(!user.password || user.password.length < 6){
            return resposta.status(400).json({ error: 'Senha não é válida' });
        }

        const existsWithSameEmail = await UserModel.find({email: user.email});
        if(existsWithSameEmail && existsWithSameEmail.length > 0){
            return resposta.status(400).json({ error: 'E-mail já cadastrado' });
        }

        user.password = CryptoJS.AES.encrypt(user.password, 'MY_SECRET_KEY').toString();

        await UserModel.create(user);

        return resposta.status(200).json({ msg: 'Usuário cadastrado com sucesso' });

    } catch (e: any) {
        console.log('Ocorreu erro ao cadastrar usuário:', e);
        resposta.status(500).json({ error: 'Ocorreu erro ao cadastrar usuário, tente novamente...' });
    }
}

export default connectToDB(endpoint);