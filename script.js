class SkillGobang {
    constructor() {
        this.boardSize = 15;
        this.board = [];
        this.currentPlayer = 1; // 1为黑方，2为白方
        this.gameStarted = false;
        this.gameEnded = false;
        this.round = 1;
        this.history = []; // 历史记录用于悔棋
        this.removedPieces = []; // 被力拔山兮移除的棋子
        
        // 游戏模式
        this.gameMode = 'multiplayer'; // 'multiplayer' 或 'singleplayer'
        this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
        this.isPlayerTurn = true; // 单机模式下，是否为玩家回合
        
        // 技能冷却时间
        this.skills = {
            feisha: { cooldown: 0, maxCooldown: 3 },     // 飞沙走石
            libashan: { cooldown: 0, maxCooldown: 5 },   // 力拔山兮
            dongshan: { cooldown: 0, maxCooldown: 1 }    // 东山再起
        };
        
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        
        // 根据屏幕尺寸调整棋盘大小
        this.adjustCanvasSize();
        
        this.selectedSkill = null; // 当前选中的技能
        
        this.initGame();
        this.bindEvents();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.adjustCanvasSize();
            this.drawBoard();
        });
    }
    
    adjustCanvasSize() {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 480) {
            this.canvas.width = 320;
            this.canvas.height = 320;
            this.cellSize = 20;
            this.boardOffset = 10;
        } else if (screenWidth <= 768) {
            this.canvas.width = 400;
            this.canvas.height = 400;
            this.cellSize = 25;
            this.boardOffset = 15;
        } else {
            this.canvas.width = 600;
            this.canvas.height = 600;
            this.cellSize = 40;
            this.boardOffset = 20;
        }
    }
    
    initGame() {
        // 初始化棋盘
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = new Array(this.boardSize).fill(0);
        }
        this.drawBoard();
        this.initGameModeSelection();
    }
    
    initGameModeSelection() {
        const multiplayerBtn = document.getElementById('multiplayer-btn');
        const singleplayerBtn = document.getElementById('singleplayer-btn');
        const backToModeBtn = document.getElementById('back-to-mode');
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        
        // 双人模式选择
        multiplayerBtn.addEventListener('click', () => {
            this.gameMode = 'multiplayer';
            document.getElementById('game-mode-selection').style.display = 'none';
            this.initRockPaperScissors();
        });
        
        // 单机模式选择
        singleplayerBtn.addEventListener('click', () => {
            this.gameMode = 'singleplayer';
            document.getElementById('game-mode-selection').style.display = 'none';
            document.getElementById('ai-difficulty-selection').style.display = 'block';
        });
        
        // 返回模式选择
        backToModeBtn.addEventListener('click', () => {
            document.getElementById('ai-difficulty-selection').style.display = 'none';
            document.getElementById('game-mode-selection').style.display = 'block';
        });
        
        // AI难度选择
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.aiDifficulty = e.target.dataset.level;
                document.getElementById('ai-difficulty-selection').style.display = 'none';
                this.initRockPaperScissors();
            });
        });
    }
    
    initRockPaperScissors() {
        document.getElementById('rock-paper-scissors').style.display = 'block';
        document.getElementById('rock-paper-scissors').innerHTML = `
            <h2>石头剪子布决定先手</h2>
            <div class="rps-choices">
                <button class="rps-btn" data-choice="rock">✊ 石头</button>
                <button class="rps-btn" data-choice="paper">✋ 布</button>
                <button class="rps-btn" data-choice="scissors">✌ 剪刀</button>
            </div>
            <div id="rps-result"></div>
        `;
        
        const rpsButtons = document.querySelectorAll('.rps-btn');
        const rpsResult = document.getElementById('rps-result');
        
        rpsButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerChoice = e.target.dataset.choice;
                const choices = ['rock', 'paper', 'scissors'];
                const computerChoice = choices[Math.floor(Math.random() * 3)];
                
                const choiceNames = {
                    rock: '石头',
                    paper: '布',
                    scissors: '剪刀'
                };
                
                let result = '';
                if (playerChoice === computerChoice) {
                    result = `平局！重新开始<br>你: ${choiceNames[playerChoice]} vs ${this.gameMode === 'multiplayer' ? '对手' : 'AI'}: ${choiceNames[computerChoice]}`;
                    return;
                } else if (
                    (playerChoice === 'rock' && computerChoice === 'scissors') ||
                    (playerChoice === 'paper' && computerChoice === 'rock') ||
                    (playerChoice === 'scissors' && computerChoice === 'paper')
                ) {
                    result = `你获胜！你先手<br>你: ${choiceNames[playerChoice]} vs ${this.gameMode === 'multiplayer' ? '对手' : 'AI'}: ${choiceNames[computerChoice]}`;
                    this.currentPlayer = 1; // 玩家先手
                    this.isPlayerTurn = true;
                } else {
                    result = `${this.gameMode === 'multiplayer' ? '对手' : 'AI'}获胜！${this.gameMode === 'multiplayer' ? '对手' : 'AI'}先手<br>你: ${choiceNames[playerChoice]} vs ${this.gameMode === 'multiplayer' ? '对手' : 'AI'}: ${choiceNames[computerChoice]}`;
                    this.currentPlayer = 2; // AI或对手先手
                    this.isPlayerTurn = this.gameMode === 'multiplayer';
                }
                
                rpsResult.innerHTML = result;
                
                setTimeout(() => {
                    document.getElementById('rock-paper-scissors').style.display = 'none';
                    document.getElementById('game-area').style.display = 'block';
                    this.gameStarted = true;
                    this.updateGameInfo();
                    
                    // 如果是单机模式且AI先手，让AI下第一步
                    if (this.gameMode === 'singleplayer' && !this.isPlayerTurn) {
                        setTimeout(() => this.makeAIMove(), 1000);
                    }
                }, 2000);
            });
        });
    }
    
    bindEvents() {
        // 棋盘点击事件
        this.canvas.addEventListener('click', (e) => {
            if (!this.gameStarted || this.gameEnded) return;
            
            if (this.selectedSkill) {
                this.handleSkillClick(e);
            } else {
                this.handleBoardClick(e);
            }
        });
        
        // 技能点击事件
        document.getElementById('skill-feisha').addEventListener('click', () => {
            this.selectSkill('feisha');
        });
        
        document.getElementById('skill-libashan').addEventListener('click', () => {
            this.selectSkill('libashan');
        });
        
        document.getElementById('skill-dongshan').addEventListener('click', () => {
            this.selectSkill('dongshan');
        });
        
        // 悔棋按钮
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoMove();
        });
        
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.boardSize; i++) {
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(this.boardOffset + i * this.cellSize, this.boardOffset);
            this.ctx.lineTo(this.boardOffset + i * this.cellSize, this.boardOffset + (this.boardSize - 1) * this.cellSize);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(this.boardOffset, this.boardOffset + i * this.cellSize);
            this.ctx.lineTo(this.boardOffset + (this.boardSize - 1) * this.cellSize, this.boardOffset + i * this.cellSize);
            this.ctx.stroke();
        }
        
        // 绘制天元和星位
        const stars = [[3,3], [3,11], [11,3], [11,11], [7,7]];
        stars.forEach(([x, y]) => {
            this.ctx.beginPath();
            this.ctx.arc(
                this.boardOffset + x * this.cellSize,
                this.boardOffset + y * this.cellSize,
                3, 0, Math.PI * 2
            );
            this.ctx.fillStyle = '#000';
            this.ctx.fill();
        });
        
        // 绘制棋子
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== 0) {
                    this.drawPiece(i, j, this.board[i][j]);
                }
            }
        }
    }
    
    drawPiece(x, y, player) {
        const centerX = this.boardOffset + x * this.cellSize;
        const centerY = this.boardOffset + y * this.cellSize;
        const radius = Math.min(this.cellSize * 0.4, 15);
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        
        if (player === 1) {
            this.ctx.fillStyle = '#000';
        } else {
            this.ctx.fillStyle = '#fff';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
        }
        
        this.ctx.fill();
        if (player === 2) {
            this.ctx.stroke();
        }
    }
    
    getBoardPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const boardX = Math.round((x - this.boardOffset) / this.cellSize);
        const boardY = Math.round((y - this.boardOffset) / this.cellSize);
        
        return { x: boardX, y: boardY };
    }
    
    handleBoardClick(e) {
        // 在单机模式下，只允许玩家在自己回合时操作
        if (this.gameMode === 'singleplayer' && !this.isPlayerTurn) {
            return;
        }
        
        const pos = this.getBoardPosition(e);
        
        if (pos.x >= 0 && pos.x < this.boardSize && pos.y >= 0 && pos.y < this.boardSize) {
            if (this.board[pos.x][pos.y] === 0) {
                this.makeMove(pos.x, pos.y);
            }
        }
    }
    
    handleSkillClick(e) {
        // 在单机模式下，只允许玩家在自己回合时使用技能
        if (this.gameMode === 'singleplayer' && !this.isPlayerTurn) {
            return;
        }
        
        const pos = this.getBoardPosition(e);
        
        if (pos.x >= 0 && pos.x < this.boardSize && pos.y >= 0 && pos.y < this.boardSize) {
            if (this.selectedSkill === 'feisha') {
                this.useFeishaSkill(pos.x, pos.y);
            } else if (this.selectedSkill === 'libashan') {
                this.useLibashanSkill();
            } else if (this.selectedSkill === 'dongshan') {
                this.useDongshanSkill();
            }
        } else {
            this.updateGameStatus('请点击棋盘范围内！');
        }
        
        this.selectedSkill = null;
        this.updateSkillButtons();
    }
    
    makeMove(x, y) {
        // 保存当前状态到历史记录
        this.saveState();
        
        this.board[x][y] = this.currentPlayer;
        this.drawBoard();
        
        if (this.checkWin(x, y)) {
            this.endGame();
            return;
        }
        
        this.nextTurn();
    }
    
    // AI移动方法
    makeAIMove() {
        if (this.gameEnded || this.gameMode !== 'singleplayer' || this.isPlayerTurn) {
            return;
        }
        
        let move = null;
        
        // 首先检查是否应该使用技能
        const skillMove = this.getAISkillMove();
        if (skillMove) {
            this.executeAISkillMove(skillMove);
            return;
        }
        
        // 根据难度选择移动策略
        switch (this.aiDifficulty) {
            case 'easy':
                move = this.getEasyAIMove();
                break;
            case 'medium':
                move = this.getMediumAIMove();
                break;
            case 'hard':
                move = this.getHardAIMove();
                break;
        }
        
        if (move) {
            this.makeMove(move.x, move.y);
        }
    }
    
    // 中级AI：基础攻防策略
    getMediumAIMove() {
        const aiPlayer = this.currentPlayer;
        const humanPlayer = aiPlayer === 1 ? 2 : 1;
        
        // 1. 检查是否能直接获胜
        const winMove = this.findWinningMove(aiPlayer);
        if (winMove) return winMove;
        
        // 2. 检查是否需要防守（阻止对手获胜）
        const blockMove = this.findWinningMove(humanPlayer);
        if (blockMove) return blockMove;
        
        // 3. 寻找最佳攻击位置
        const attackMove = this.findBestAttackMove(aiPlayer);
        if (attackMove) return attackMove;
        
        // 4. 如果没有好的攻击位置，选择战略位置
        return this.findStrategicMove();
    }
    
    // 寻找获胜移动
    findWinningMove(player) {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 0) {
                    this.board[i][j] = player;
                    if (this.checkWin(i, j)) {
                        this.board[i][j] = 0;
                        return { x: i, y: j };
                    }
                    this.board[i][j] = 0;
                }
            }
        }
        return null;
    }
    
    // 寻找最佳攻击位置
    findBestAttackMove(player) {
        const moves = [];
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 0) {
                    const score = this.evaluatePosition(i, j, player);
                    if (score > 0) {
                        moves.push({ x: i, y: j, score: score });
                    }
                }
            }
        }
        
        if (moves.length === 0) return null;
        
        moves.sort((a, b) => b.score - a.score);
        return moves[0];
    }
    
    // 评估位置价值
    evaluatePosition(x, y, player) {
        let totalScore = 0;
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        
        for (let [dx, dy] of directions) {
            totalScore += this.evaluateDirection(x, y, dx, dy, player);
        }
        
        // 中心位置加分
        const centerBonus = Math.max(0, 5 - Math.abs(x - 7) - Math.abs(y - 7)) * 2;
        
        return totalScore + centerBonus;
    }
    
    // 评估某个方向的价值
    evaluateDirection(x, y, dx, dy, player) {
        let score = 0;
        let consecutive = 1;
        let openEnds = 0;
        
        // 正向检查
        let i = 1;
        while (i < 5) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize) {
                if (this.board[nx][ny] === player) {
                    consecutive++;
                    i++;
                } else if (this.board[nx][ny] === 0) {
                    openEnds++;
                    break;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        
        // 反向检查
        i = 1;
        while (i < 5) {
            const nx = x - dx * i;
            const ny = y - dy * i;
            if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize) {
                if (this.board[nx][ny] === player) {
                    consecutive++;
                    i++;
                } else if (this.board[nx][ny] === 0) {
                    openEnds++;
                    break;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        
        // 根据连续数和开放端数评分
        if (consecutive >= 4) score += 1000;
        else if (consecutive === 3 && openEnds >= 1) score += 100;
        else if (consecutive === 2 && openEnds >= 1) score += 10;
        else if (consecutive === 1 && openEnds >= 1) score += 1;
        
        return score;
    }
    
    // 高级AI：使用minimax算法和威胁评估
    getHardAIMove() {
        const aiPlayer = this.currentPlayer;
        const humanPlayer = aiPlayer === 1 ? 2 : 1;
        
        // 1. 检查是否能直接获胜
        const winMove = this.findWinningMove(aiPlayer);
        if (winMove) return winMove;
        
        // 2. 检查是否需要防守
        const blockMove = this.findWinningMove(humanPlayer);
        if (blockMove) return blockMove;
        
        // 3. 使用minimax算法寻找最佳位置
        const bestMove = this.minimax(2, aiPlayer, -Infinity, Infinity);
        if (bestMove.move) return bestMove.move;
        
        // 4. 备用策略
        return this.getMediumAIMove();
    }
    
    // Minimax算法实现
    minimax(depth, player, alpha, beta) {
        const aiPlayer = this.currentPlayer;
        const humanPlayer = aiPlayer === 1 ? 2 : 1;
        
        // 检查终止条件
        if (depth === 0) {
            return { score: this.evaluateBoardPosition(aiPlayer), move: null };
        }
        
        const availableMoves = this.getAvailableMoves();
        if (availableMoves.length === 0) {
            return { score: 0, move: null };
        }
        
        let bestMove = null;
        
        if (player === aiPlayer) {
            let maxScore = -Infinity;
            
            for (let move of availableMoves) {
                this.board[move.x][move.y] = player;
                
                // 检查是否获胜
                if (this.checkWin(move.x, move.y)) {
                    this.board[move.x][move.y] = 0;
                    return { score: 10000, move: move };
                }
                
                const result = this.minimax(depth - 1, humanPlayer, alpha, beta);
                this.board[move.x][move.y] = 0;
                
                if (result.score > maxScore) {
                    maxScore = result.score;
                    bestMove = move;
                }
                
                alpha = Math.max(alpha, result.score);
                if (beta <= alpha) break; // Alpha-beta剪枝
            }
            
            return { score: maxScore, move: bestMove };
        } else {
            let minScore = Infinity;
            
            for (let move of availableMoves) {
                this.board[move.x][move.y] = player;
                
                // 检查是否获胜
                if (this.checkWin(move.x, move.y)) {
                    this.board[move.x][move.y] = 0;
                    return { score: -10000, move: move };
                }
                
                const result = this.minimax(depth - 1, aiPlayer, alpha, beta);
                this.board[move.x][move.y] = 0;
                
                if (result.score < minScore) {
                    minScore = result.score;
                    bestMove = move;
                }
                
                beta = Math.min(beta, result.score);
                if (beta <= alpha) break; // Alpha-beta剪枝
            }
            
            return { score: minScore, move: bestMove };
        }
    }
    
    // 获取可用移动位置（限制搜索空间）
    getAvailableMoves() {
        const moves = [];
        const hasAnyPiece = this.board.some(row => row.some(cell => cell !== 0));
        
        if (!hasAnyPiece) {
            // 如果棋盘为空，返回中心位置
            const center = Math.floor(this.boardSize / 2);
            return [{ x: center, y: center }];
        }
        
        // 只考虑已有棋子附近的位置
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 0) {
                    let hasNeighbor = false;
                    
                    for (let di = -2; di <= 2 && !hasNeighbor; di++) {
                        for (let dj = -2; dj <= 2 && !hasNeighbor; dj++) {
                            if (di === 0 && dj === 0) continue;
                            const ni = i + di;
                            const nj = j + dj;
                            if (ni >= 0 && ni < this.boardSize && nj >= 0 && nj < this.boardSize) {
                                if (this.board[ni][nj] !== 0) {
                                    hasNeighbor = true;
                                }
                            }
                        }
                    }
                    
                    if (hasNeighbor) {
                        const score = this.evaluatePosition(i, j, this.currentPlayer);
                        moves.push({ x: i, y: j, score: score });
                    }
                }
            }
        }
        
        // 按分数排序，只返回前15个最佳位置
        moves.sort((a, b) => b.score - a.score);
        return moves.slice(0, Math.min(15, moves.length));
    }
    
    // 评估整个棋盘位置
    evaluateBoardPosition(player) {
        const opponent = player === 1 ? 2 : 1;
        let score = 0;
        
        // 评估所有方向的威胁
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === player) {
                    score += this.evaluatePosition(i, j, player);
                } else if (this.board[i][j] === opponent) {
                    score -= this.evaluatePosition(i, j, opponent) * 1.1; // 稍微重视防守
                }
            }
        }
        
        return score;
    }
    
    // 添加初级AI的完整实现
    getEasyAIMove() {
        const emptyCells = [];
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 0) {
                    // 优先选择中心区域
                    const centerBonus = Math.max(0, 7 - Math.abs(i - 7) - Math.abs(j - 7)) / 10;
                    emptyCells.push({ x: i, y: j, weight: Math.random() + centerBonus });
                }
            }
        }
        
        if (emptyCells.length === 0) return null;
        
        // 按权重排序，选择权重较高的位置
        emptyCells.sort((a, b) => b.weight - a.weight);
        const topChoices = emptyCells.slice(0, Math.min(5, emptyCells.length));
        return topChoices[Math.floor(Math.random() * topChoices.length)];
    }
    
    // 寻找战略位置
    findStrategicMove() {
        // 优先选择有棋子附近的位置
        for (let i = 1; i < this.boardSize - 1; i++) {
            for (let j = 1; j < this.boardSize - 1; j++) {
                if (this.board[i][j] === 0) {
                    let hasNeighbor = false;
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (di === 0 && dj === 0) continue;
                            if (this.board[i + di][j + dj] !== 0) {
                                hasNeighbor = true;
                                break;
                            }
                        }
                        if (hasNeighbor) break;
                    }
                    if (hasNeighbor) {
                        return { x: i, y: j };
                    }
                }
            }
        }
        
        // 如果没有邻近位置，选择中心区域
        const center = Math.floor(this.boardSize / 2);
        for (let radius = 0; radius < 5; radius++) {
            for (let i = Math.max(0, center - radius); i <= Math.min(this.boardSize - 1, center + radius); i++) {
                for (let j = Math.max(0, center - radius); j <= Math.min(this.boardSize - 1, center + radius); j++) {
                    if (this.board[i][j] === 0) {
                        return { x: i, y: j };
                    }
                }
            }
        }
        
        return null;
    }
    
    // AI技能使用策略
    getAISkillMove() {
        const aiPlayer = this.currentPlayer;
        const humanPlayer = aiPlayer === 1 ? 2 : 1;
        
        // 飞沙走石：移除对手关键棋子
        if (this.skills.feisha.cooldown === 0) {
            const targetPiece = this.findKeyOpponentPiece(humanPlayer);
            if (targetPiece) {
                return { skill: 'feisha', target: targetPiece };
            }
        }
        
        // 力拔山兮：在对手控制中心时使用
        if (this.skills.libashan.cooldown === 0) {
            const centerControl = this.evaluateCenterControl(humanPlayer);
            if (centerControl > 3) {
                return { skill: 'libashan' };
            }
        }
        
        // 东山再起：恢复重要棋子
        if (this.skills.dongshan.cooldown === 0 && this.removedPieces.length > 0) {
            const worthRestore = this.removedPieces.some(piece => piece.player === aiPlayer);
            if (worthRestore) {
                return { skill: 'dongshan' };
            }
        }
        
        return null;
    }
    
    // 寻找对手关键棋子
    findKeyOpponentPiece(opponent) {
        const threats = [];
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === opponent) {
                    const threatLevel = this.evaluatePosition(i, j, opponent);
                    if (threatLevel > 50) { // 只考虑高威胁的棋子
                        threats.push({ x: i, y: j, threat: threatLevel });
                    }
                }
            }
        }
        
        if (threats.length > 0) {
            threats.sort((a, b) => b.threat - a.threat);
            return threats[0];
        }
        
        return null;
    }
    
    // 评估中心控制度
    evaluateCenterControl(player) {
        const center = Math.floor(this.boardSize / 2);
        let control = 0;
        
        for (let i = center - 3; i <= center + 3; i++) {
            for (let j = center - 3; j <= center + 3; j++) {
                if (i >= 0 && i < this.boardSize && j >= 0 && j < this.boardSize) {
                    if (this.board[i][j] === player) {
                        control++;
                    }
                }
            }
        }
        
        return control;
    }
    
    // 执行AI技能移动
    executeAISkillMove(skillMove) {
        this.saveState();
        
        if (skillMove.skill === 'feisha') {
            this.board[skillMove.target.x][skillMove.target.y] = 0;
            this.skills.feisha.cooldown = this.skills.feisha.maxCooldown;
            this.updateGameStatus(`AI使用飞沙走石！移除了你的棋子`);
        } else if (skillMove.skill === 'libashan') {
            const center = Math.floor(this.boardSize / 2);
            const range = 3;
            let removedCount = 0;
            
            for (let i = center - range; i <= center + range; i++) {
                for (let j = center - range; j <= center + range; j++) {
                    if (i >= 0 && i < this.boardSize && j >= 0 && j < this.boardSize) {
                        if (this.board[i][j] !== 0) {
                            this.removedPieces.push({
                                x: i, y: j, player: this.board[i][j]
                            });
                            this.board[i][j] = 0;
                            removedCount++;
                        }
                    }
                }
            }
            
            this.skills.libashan.cooldown = this.skills.libashan.maxCooldown;
            this.updateGameStatus(`AI使用力拔山兮！清除了${removedCount}颗棋子`);
        } else if (skillMove.skill === 'dongshan') {
            let restoredCount = 0;
            this.removedPieces.forEach(piece => {
                if (this.board[piece.x][piece.y] === 0) {
                    this.board[piece.x][piece.y] = piece.player;
                    restoredCount++;
                }
            });
            
            this.removedPieces = [];
            this.skills.dongshan.cooldown = this.skills.dongshan.maxCooldown;
            this.updateGameStatus(`AI使用东山再起！恢复了${restoredCount}颗棋子`);
        }
        
        this.drawBoard();
        this.nextTurn();
    }
    
    saveState() {
        const state = {
            board: this.board.map(row => [...row]),
            currentPlayer: this.currentPlayer,
            round: this.round,
            skills: JSON.parse(JSON.stringify(this.skills)),
            removedPieces: [...this.removedPieces]
        };
        this.history.push(state);
        
        // 限制历史记录长度
        if (this.history.length > 10) {
            this.history.shift();
        }
    }
    
    undoMove() {
        if (this.history.length === 0 || this.gameEnded) return;
        
        const lastState = this.history.pop();
        this.board = lastState.board;
        this.currentPlayer = lastState.currentPlayer;
        this.round = lastState.round;
        this.skills = lastState.skills;
        this.removedPieces = lastState.removedPieces;
        
        this.drawBoard();
        this.updateGameInfo();
        this.updateSkillButtons();
    }
    
    selectSkill(skillName) {
        // 在单机模式下，只允许玩家在自己回合时选择技能
        if (this.gameMode === 'singleplayer' && !this.isPlayerTurn) {
            return;
        }
        
        if (this.skills[skillName].cooldown > 0) {
            this.updateGameStatus('技能还在冷却中！');
            return;
        }
        
        if (this.selectedSkill === skillName) {
            this.selectedSkill = null;
            this.updateGameStatus('点击棋盘落子');
        } else {
            this.selectedSkill = skillName;
            const skillNames = {
                feisha: '飞沙走石：点击对方棋子移除',
                libashan: '力拔山兮：清除中央区域所有棋子',
                dongshan: '东山再起：恢复被清除的棋子'
            };
            this.updateGameStatus(skillNames[skillName]);
        }
        
        this.updateSkillButtons();
    }
    
    useFeishaSkill(x, y) {
        if (this.board[x][y] === 0 || this.board[x][y] === this.currentPlayer) {
            this.updateGameStatus('请选择对方的棋子！');
            return;
        }
        
        this.saveState();
        this.board[x][y] = 0;
        this.skills.feisha.cooldown = this.skills.feisha.maxCooldown;
        this.drawBoard();
        this.updateGameStatus('飞沙走石！对方棋子被移除');
        this.nextTurn();
    }
    
    useLibashanSkill() {
        this.saveState();
        
        // 清除中央7x7区域的棋子
        const center = Math.floor(this.boardSize / 2);
        const range = 3;
        let removedCount = 0;
        
        for (let i = center - range; i <= center + range; i++) {
            for (let j = center - range; j <= center + range; j++) {
                if (i >= 0 && i < this.boardSize && j >= 0 && j < this.boardSize) {
                    if (this.board[i][j] !== 0) {
                        this.removedPieces.push({
                            x: i, y: j, player: this.board[i][j]
                        });
                        this.board[i][j] = 0;
                        removedCount++;
                    }
                }
            }
        }
        
        this.skills.libashan.cooldown = this.skills.libashan.maxCooldown;
        this.drawBoard();
        this.updateGameStatus(`力拔山兮！清除了${removedCount}颗棋子`);
        this.nextTurn();
    }
    
    useDongshanSkill() {
        if (this.removedPieces.length === 0) {
            this.updateGameStatus('没有可恢复的棋子！');
            return;
        }
        
        this.saveState();
        
        let restoredCount = 0;
        // 恢复所有被力拔山兮清除的棋子
        this.removedPieces.forEach(piece => {
            if (this.board[piece.x][piece.y] === 0) {
                this.board[piece.x][piece.y] = piece.player;
                restoredCount++;
            }
        });
        
        this.removedPieces = [];
        this.skills.dongshan.cooldown = this.skills.dongshan.maxCooldown;
        this.drawBoard();
        this.updateGameStatus(`东山再起！恢复了${restoredCount}颗棋子`);
        this.nextTurn();
    }
    
    nextTurn() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.round++;
        
        // 在单机模式下切换玩家回合状态
        if (this.gameMode === 'singleplayer') {
            this.isPlayerTurn = !this.isPlayerTurn;
        }
        
        // 减少技能冷却时间
        Object.keys(this.skills).forEach(skill => {
            if (this.skills[skill].cooldown > 0) {
                this.skills[skill].cooldown--;
            }
        });
        
        this.selectedSkill = null;
        this.updateGameInfo();
        this.updateSkillButtons();
        
        if (this.gameMode === 'multiplayer') {
            this.updateGameStatus('点击棋盘落子');
        } else {
            if (this.isPlayerTurn) {
                this.updateGameStatus('轮到你了，点击棋盘落子');
            } else {
                this.updateGameStatus('AI思考中...');
                // AI延迟一段时间再行动，增加真实感
                setTimeout(() => this.makeAIMove(), 800 + Math.random() * 1200);
            }
        }
    }
    
    updateGameStatus(message) {
        document.getElementById('game-status-text').textContent = message;
        
        // 3秒后恢复默认状态
        setTimeout(() => {
            if (!this.selectedSkill && !this.gameEnded) {
                document.getElementById('game-status-text').textContent = '点击棋盘落子';
            }
        }, 3000);
    }
    
    checkWin(x, y) {
        const player = this.board[x][y];
        const directions = [
            [1, 0], [0, 1], [1, 1], [1, -1]
        ];
        
        for (let [dx, dy] of directions) {
            let count = 1;
            
            // 正向检查
            for (let i = 1; i < 5; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize && 
                    this.board[nx][ny] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 反向检查
            for (let i = 1; i < 5; i++) {
                const nx = x - dx * i;
                const ny = y - dy * i;
                if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize && 
                    this.board[nx][ny] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            if (count >= 5) return true;
        }
        
        return false;
    }
    
    endGame() {
        this.gameEnded = true;
        const winnerText = this.currentPlayer === 1 ? '黑方获胜！' : '白方获胜！';
        document.getElementById('winner-text').textContent = winnerText;
        document.getElementById('game-result').style.display = 'flex';
    }
    
    updateGameInfo() {
        let playerName;
        if (this.gameMode === 'multiplayer') {
            playerName = this.currentPlayer === 1 ? '黑方' : '白方';
        } else {
            if (this.isPlayerTurn) {
                playerName = '玩家 (' + (this.currentPlayer === 1 ? '黑方' : '白方') + ')';
            } else {
                playerName = 'AI (' + (this.currentPlayer === 1 ? '黑方' : '白方') + ')';
            }
        }
        
        document.getElementById('current-player').textContent = playerName;
        document.getElementById('round-counter').textContent = this.round;
        
        // 更新悔棋按钮状态
        const undoBtn = document.getElementById('undo-btn');
        undoBtn.disabled = this.history.length === 0 || this.gameEnded || 
                          (this.gameMode === 'singleplayer' && !this.isPlayerTurn);
    }
    
    updateSkillButtons() {
        Object.keys(this.skills).forEach(skillName => {
            const cooldownSpan = document.getElementById(`${skillName}-cooldown`);
            const skillCard = document.getElementById(`skill-${skillName}`).parentElement;
            
            cooldownSpan.textContent = this.skills[skillName].cooldown;
            
            // 移除所有状态类
            skillCard.classList.remove('skill-disabled', 'skill-selected');
            
            if (this.skills[skillName].cooldown > 0) {
                skillCard.classList.add('skill-disabled');
            }
            
            // 高亮选中的技能
            if (this.selectedSkill === skillName) {
                skillCard.classList.add('skill-selected');
            }
        });
    }
    
    restartGame() {
        this.board = [];
        this.currentPlayer = 1;
        this.gameStarted = false;
        this.gameEnded = false;
        this.round = 1;
        this.history = [];
        this.removedPieces = [];
        this.selectedSkill = null;
        this.isPlayerTurn = true;
        
        // 重置技能冷却
        this.skills = {
            feisha: { cooldown: 0, maxCooldown: 3 },
            libashan: { cooldown: 0, maxCooldown: 5 },
            dongshan: { cooldown: 0, maxCooldown: 1 }
        };
        
        document.getElementById('game-result').style.display = 'none';
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('game-mode-selection').style.display = 'block';
        
        this.initGame();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SkillGobang();
});