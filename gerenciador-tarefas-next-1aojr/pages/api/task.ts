import type { NextApiRequest, NextApiResponse } from 'next'
import { use } from 'react';
import { json } from 'stream/consumers';
import { connectToDB } from '../../middlewares/connectToDB';
import { UserModel } from '../../models/User';
import { DefaultMessageResponse } from '../../types/DefaultMessageResponse';
import CryptoJS from "crypto-js";
import { jwtValidator } from '../../middlewares/jwtValidator';
import { TaskModel } from '../../models/Task';
import { Task } from '../../types/Task';

const endpoint = async (requisicao: NextApiRequest, resposta: NextApiResponse<DefaultMessageResponse | any>) => {

    try {

        if (requisicao.method === 'GET') {
            return getTasks(requisicao,resposta);
        }

        if (requisicao.method === 'POST') {
            return saveTask(requisicao,resposta);
        }

    } catch (e: any) {
        console.log('Ocorreu erro ao listar tarefas do usuário:', e);
        resposta.status(500).json({ error: 'Ocorreu erro ao listar tarefas do usuário, tente novamente...' });
    }
}

const getTasks = async (requisicao: NextApiRequest, resposta: NextApiResponse<DefaultMessageResponse | any>) => {
    const tasks = await TaskModel.find({userId: requisicao.query.userId});
    return resposta.status(200).json(tasks);
}

const saveTask = async (requisicao: NextApiRequest, resposta: NextApiResponse<DefaultMessageResponse | any>) => {
    if (!requisicao.body) {
        return resposta.status(400).json({ error: 'Favor informar os dados para cadastro' });
    }

    const task = requisicao.body as Task;

    if(!task.userId){
        return resposta.status(400).json({ error: 'Usuário não encontrado' });
    }
    
    if(!task.name || task.name.length < 2){
        return resposta.status(400).json({ error: 'Nome não é válido' });
    }

    if(!task.finishPrevisionDate || task.finishPrevisionDate.length < 8){
        return resposta.status(400).json({ error: 'Data de previsão não é válida' });
    }

    await TaskModel.create(task);
    return resposta.status(200).json({msg: 'Tarefa cadastrada com sucesso'});
}

export default connectToDB(jwtValidator(endpoint));