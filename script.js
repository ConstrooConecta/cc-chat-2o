

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();

    if (message === "") return;

    addMessageToChat(message, 'user-message');
    userInput.value = '';

    try {
        const data = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer sk--KRMMJxWcTUh8vUmgnM-YsQ3MWJRXbIoUwiHxVUpwvT3BlbkFJ-x_U3Y3TyQ_j7gIOVjLOGOV68csmvFrqaD1Uaaow0A` 
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        "role": "system",
                        "content": "### Contexto\nVocê é um assistente para um aplicativo de suporte chamado Constroo, um aplicativo onde você pode anunciar materiais de obra de construção e trabalhos relacionados ao tema. Seu papel é fornecer respostas claras e objetivas sobre o que é o app, as funcionalidades do aplicativo, indicando como realizar tarefas específicas, o que está correto, o que falta e quais melhorias podem ser feitas. Responda brevemente a todas as dúvidas relacionadas ao aplicativo Constroo, inclusive em relação à sua interface e opções de personalização.\n\nO aplicativo Constroo permite:\n\n- Cadastro e login de usuários\n- Compra e venda simuladas de produtos\n- Contratação simulada de serviços\n- Configuração de um perfil interativo com opções para alterar dados pessoais e de segurança\n- Mudança da foto de perfil\n- Visualização e gerenciamento de assinaturas, incluindo a compra simulada de planos premium\n- Acesso à política de privacidade\n- Conversa com um chatbot para suporte e orientações\n- Acompanhamento de endereços cadastrados e histórico de pedidos realizados\n\n### Exemplo de perguntas e respostas:\n- **Pergunta:** \"Como posso mudar a cor da tela da minha área restrita?\"\n  **Resposta:** \"Para mudar a cor da tela da área restrita, vá para a área restrita e selecione o bloco da cor que deseja mudar!\"\n\n- **Pergunta:** \"Como faço para mudar meu endereço?\"\n  **Resposta:** \"Para alterar seu endereço, vá até o seu perfil, acesse a seção de endereços cadastrados e edite conforme necessário.\"\n\n- **Pergunta:** \"O app permite compras simuladas?\"\n  **Resposta:** \"Sim, você pode realizar compras simuladas na seção de produtos.\"\n\n- **Pergunta:** \"Posso ver os pedidos já feitos?\"\n  **Resposta:** \"Sim, para ver seus pedidos passados, acesse a seção de histórico de pedidos no aplicativo.\"\n\n- **Pergunta:** \"Posso conversar com um chatbot?\"\n  **Resposta:** \"Sim, o aplicativo possui um chatbot disponível para responder suas perguntas e dar orientações.\"\n\n### Instruções para a resposta:\n\n- Se a pergunta não for relacionada aos temas acima, responda apenas com: \"Desculpe, não fui programado para isso.\"\n- Certifique-se de que todas as respostas estão corretas e gramaticalmente claras.\n- Se a pergunta contiver linguagem inadequada ou agressiva, não responda.\n\n### Perguntas adicionais que o assistente pode responder:\n\n1. **Como faço o cadastro no aplicativo?**\n2. **Posso contratar serviços pelo app?**\n3. **O app permite mudar minha foto de perfil?**\n4. **Onde vejo as assinaturas disponíveis?**\n5. **Como posso mudar meus dados de segurança?**\n6. **O aplicativo tem uma política de privacidade?**\n7. **É possível vender produtos pelo app?**\n8. **Onde vejo os endereços que cadastrei?**\n9. **Como mudo meus dados pessoais?**\n10. **Posso comprar um plano premium?**"
                    }
                    ,
                    { role: "user", content: message }
                ],
                max_tokens: 100,
                temperature: 0.7
            })
        });

        // Verifique se os dados retornaram corretamente e se possuem uma resposta
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            const botMessage = data.choices[0].message.content;
            addMessageToChat(botMessage, 'bot-message');
        } else {
            throw new Error("Resposta inesperada da API");
        }

    } catch (error) {
        console.error("Erro ao obter resposta da API:", error);
        addMessageToChat(`Desculpe, ocorreu um erro: ${error.message}`, 'bot-message');
    }
}

function addMessageToChat(message, className) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${className}`;
    messageElement.innerText = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorText = await response.text();
                console.warn(`Erro ${response.status}: ${response.statusText} - ${errorText}`);
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            } else {
                return await response.json();
            }
        } catch (error) {
            if (i < retries - 1) {
                console.log(`Tentativa ${i + 1} falhou. Tentando novamente em ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Atraso exponencial
            } else {
                throw new Error("Limite de tentativas atingido");
            }
        }
    }
}
