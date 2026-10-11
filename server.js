const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client'); // Importa o Prisma

const app = express();
const prisma = new PrismaClient(); // Inicia a conexão com o banco

app.use(express.json());
app.use(express.static(__dirname)); // Serve o HTML/CSS/JS

// --- ROTAS DA API ---

// 1. Rota de teste
app.get('/api/status', (req, res) => {
    res.json({ mensagem: 'Servidor e Banco de Dados rodando!' });
});

// 2. Rota para ABRIR UM CHAMADO (Salvar no Banco)
app.post('/api/chamados', async (req, res) => {
    try {
        const { nome, email, senha, equipamentoTipo, servicos, descricao, protocolo } = req.body;

        // 1. Garante que o Cliente existe (ou cria um novo)
        let user = await prisma.user.findUnique({ where: { email: email } });
        if (!user) {
            user = await prisma.user.create({
                data: { nome, email, senha }
            });
        }

        // 2. Cria o Equipamento
        const equipamento = await prisma.equipamento.create({
            data: { tipo: equipamentoTipo }
        });

        // 3. Cria o Chamado atrelando ao Usuário e Equipamento
        const chamado = await prisma.chamado.create({
            data: {
                protocolo: protocolo,
                descricao: descricao,
                servicos: servicos, 
                userId: user.id,
                equipamentoId: equipamento.id
            }
        });

        // Retorna sucesso
        res.status(201).json({ 
            mensagem: 'Chamado criado com sucesso!', 
            chamado: chamado 
        });

    } catch (error) {
        console.error("Erro ao criar chamado:", error);
        res.status(500).json({ erro: 'Erro interno ao tentar salvar o chamado.' });
    }
});

// 3. Rota para os TÉCNICOS listarem os chamados abertos
app.get('/api/chamados', async (req, res) => {
    const chamados = await prisma.chamado.findMany({
        include: {
            user: true,
            equipamento: true
        }
    });
    res.json(chamados);
});

// Inicia o Servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});