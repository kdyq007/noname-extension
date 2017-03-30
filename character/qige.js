'use strict';
character.qige = {
    connect: true,
    character: {
        qi_leishen: ["male", "qun", 4, ["qi_tianlei", "qi_chaofeng", "qi_qicai", "qi_gongdao"]],
        qi_wanciwang: ["male", "qun", 4, ["qi_kongci", "qi_cibao", "qi_cichang", "qi_zhuzai"]],
        qi_huoshen: ["male", "qun", 4, ["qi_huoqi", "qi_lieyan", "qi_fencheng", "qi_huoqu"]],
    },
    characterIntro: {
        qi_leishen: '雷神·奇哥',
        qi_wanciwang: '万磁王·奇哥',
        qi_huoshen: '火神·奇哥',
    },
    skill: {
        qi_tianlei: {
            audio: "leiji1",
            trigger: {
                player: "respond",
            },
            filter: function (event, player) {
                return event.card.name == 'shan';
            },
            direct: true,
            content: function () {
                "step 0";
                player.chooseTarget(get.prompt('leiji')).ai = function (target) {
                    return ai.get.damageEffect(target, _status.event.player, _status.event.player, 'thunder');
                };
                "step 1"
                if (result.bool) {
                    player.logSkill('leiji', result.targets, 'thunder');
                    event.target = result.targets[0];
                    event.target.judge(function (card) {
                        var suit = get.suit(card);
                        if (suit == 'spade') return -4;
                        if (suit == 'club' || suit == 'diamond') return -2;
                        return 0;
                    });
                }
                else {
                    event.finish();
                }
                "step 2"
                if (result.suit == 'spade') {
                    event.target.damage(2, 'thunder');
                }
                else if (result.suit == 'heart') {
                    if (target.hasSkill('hongyan')) {
                        event.target.damage(2, 'thunder');
                    }
                    else {
                        player.recover(2, 'nosource');
                    }
                }
                else {
                    event.target.damage('thunder');
                    player.recover();
                }
            },
            ai: {
                effect: {
                    target: function (card, player, target, current) {
                        if (get.tag(card, 'respondShan')) {
                            var hastarget = game.hasPlayer(function (current) {
                                return ai.get.attitude(target, current) < 0;
                            });
                            var be = target.num('e', {color: 'black'});
                            if (target.num('h', 'shan') && be) {
                                if (!target.hasSkill('guidao')) return 0;
                                return [0, hastarget ? target.num('he') / 2 : 0];
                            }
                            if (target.num('h', 'shan') && target.num('h') > 2) {
                                if (!target.hasSkill('guidao')) return 0;
                                return [0, hastarget ? target.num('h') / 4 : 0];
                            }
                            if (target.num('h') > 3 || (be && target.num('h') >= 2)) {
                                return [0, 0];
                            }
                            if (target.num('h') == 0) {
                                return [1.5, 0];
                            }
                            if (target.num('h') == 1 && !be) {
                                return [1.2, 0];
                            }
                            if (!target.hasSkill('guidao')) return [1, 0.05];
                            return [1, Math.min(0.5, (target.num('h') + be) / 4)];
                        }
                    },
                },
            },
        },
        qi_chaofeng: {
            audio: "luoyi2",
            enable: "phaseUse",
            usable: 1,
            filterTarget: function (card, player, target) {
                return target.num('he');
            },
            ai: {
                order: 10,
                expose: 0.1,
                threaten: 1.1,
                result: {
                    target: -1,
                    player: function (player, target) {
                        if (player.num('h', 'shan') > 0) {
                            if (target.num('h', 'sha') > 0) return 2;
                        }
                        else {
                            if (target.num('h', 'sha') > 0) return -1;
                        }
                        return 1;
                    },
                },
            },
            content: function () {
                if (target.get('h', 'sha').length > 0) {
                    target.useCard(target.get('h', 'sha')[0], player);
                }
                else {
                    player.discardPlayerCard(target, 'he', true);
                }
                event.finish();
            },
        },
        qi_qicai: {
            audio: "guicai1",
            trigger: {
                global: "judge",
            },
            filter: function (event, player) {
                return player.num('he') > 0;
            },
            direct: true,
            content: function () {
                "step 0"
                player.chooseCard(get.translation(trigger.player) + '的' + (trigger.judgestr || '') + '判定为' +
                    get.translation(trigger.player.judging[0]) + '，是否发动【奇才】？', 'he').set('ai', function (card) {
                    var trigger = _status.event.getTrigger();
                    var player = _status.event.player;
                    var judging = _status.event.judging;
                    var result = trigger.judge(card) - trigger.judge(judging);
                    var attitude = ai.get.attitude(player, trigger.player);
                    if (attitude == 0 || result == 0) return 0;
                    if (attitude > 0) {
                        return result;
                    }
                    else {
                        return -result;
                    }
                }).set('judging', trigger.player.judging[0]);
                "step 1"
                if (result.bool) {
                    player.respond(result.cards, 'highlight');
                }
                else {
                    event.finish();
                }
                "step 2"
                if (result.bool) {
                    player.logSkill('guidao');
                    player.$gain2(trigger.player.judging[0]);
                    player.gain(trigger.player.judging[0]);
                    trigger.player.judging[0] = result.cards[0];
                    if (!get.owner(result.cards[0], 'judge')) {
                        trigger.position.appendChild(result.cards[0]);
                    }
                    game.log(trigger.player, '的判定牌改为', result.cards[0]);
                }
                "step 3"
                game.delay(2);
            },
            ai: {
                tag: {
                    rejudge: 1,
                },
            },
        },
        qi_gongdao: {
            audio: "weimu2",
            trigger: {
                player: "damageEnd",
            },
            direct: true,
            filter: function (event, player) {
                return (event.source && event.num > 0 && event.source != player);
            },
            content: function () {
                for (i = 0; i < trigger.num; i++) {
                    player.gain(game.createCard({name: 'shan'}), 'draw');
                }
            },
        },
        qi_kongci: {
            audio: "lianhuan12",
			direct:true,
            trigger: {
                player: ["phaseBegin", "phaseEnd"],
            },
            check: function (event, player) {
                if (player.hp > 1 && !player.isLinked) return true;
                for (var i = 0; i < game.players.length; i++) {
                    if (ai.get.attitude(player, game.players[i]) <= 0 && !game.players[i].isLinked()) {
                        return true;
                    }
                }
                return false;
            },
            content: function () {
                "step 0"
                player.chooseTarget('是否发动【控磁】？', [1, game.players.length], false).ai = function (target) {
                    if (target == player) {
                        if (player.hp > 1 && !target.isLinked()) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    if (ai.get.attitude(player, target) > 0) {
                        if (target.isLinked()) return true;
                    }
                    else {
                        if (!target.isLinked()) return true;
                    }
                    return false;
                }

                "step 1"
                if (result.bool) {
                    player.logSkill('qi_kongci', result.targets);
                    for (var i = 0; i < result.targets.length; i++) {
                        result.targets[i].link();
                    }
                }
                else {
                    event.finish();
                }
                "step 2"
                if (result.bool) game.delay();
            },
            ai: {
                threaten: 1,
                expose: 0.1,
            },
        },
        qi_cibao: {
            audio: "lianhuan11",
            trigger: {
                player: "useCardToBefore",
            },
            priority: 8,
            filter: function (event, player) {
                if (event.card.name == 'sha' && player.storage.qi_cichang > 0) return true;
            },
            check: function (event, player) {
                var good = 0, bad = 0;
                for (var i = 0; i < game.players.length; i++) {
                    if (game.players[i].isLinked() && player != game.players[i]) {
                        if (ai.get.attitude(player, game.players[i]) > 0) {
                            good++;
                            if(game.players[i].hp==1&&player.identity!='fan'&&player.identity!='nei'){
                                return -2;
                            }
                        }
                        else {
                            bad++;
                        }
                    }
                }
                if (bad > good) return 1;
                return -1;
            },
            content: function () {
                player.storage.qi_cichang--;
                player.syncStorage('qi_cichang');
                if (player.storage.qi_cichang == 0) player.unmarkSkill('qi_cichang');
                trigger.card.nature = 'thunder';
                trigger.directHit = true;
            },
        },
        qi_zhuzai: {
            audio: "weimu1",
            trigger: {
                player: "damageBefore",
            },
            direct: true,
            filter: function (event, player) {
                return event.source != player && player.storage.qi_cichang > 0;
            },
            check: function (event, player) {
                if (player.hp == 1) return true;
                if (event.num > 1) return false;
                if (player.isLinked()) {
                    for (var i = 0; i < game.players.length; i++) {
                        if (game.players[i].hp <= event.num && game.players[i].isLinked()) return false;
                    }
                }
                if (player.storage.qi_cichang > 1) return true;
                return false;
            },
            content: function () {
                "step 0"
                player.chooseBool('是否消耗一点电磁来抵挡此次伤害？');
                "step 1"
                if (result.bool) {
                    player.storage.qi_cichang--;
                    player.syncStorage('qi_cichang');
                    if (player.storage.qi_cichang == 0) player.unmarkSkill('qi_cichang');
                    player.logSkill('qi_zhuzai', trigger.source);
                    trigger.untrigger();
                    trigger.finish();
                }
                //if(!player.isLinked()) player.link();
                //if(!trigger.source.isLinked()) trigger.source.link();
            },
        },
        qi_cichang: {
            audio: "lianhuan14",
            trigger: {
                player: "damageBegin",
            },
            priority: -100,
            forced: true,
            group: "qi_cichang1",
            filter: function (event, player) {
                if (event.nature == 'fire') return false;
                return true
            },
            init: function (player) {
                player.storage.qi_cichang = 2;
                player.markSkill('qi_cichang');
                player.storage.qi_cichang1 = 0;
            },
            content: function () {
                player.storage.qi_cichang1 = trigger.num;
                player.storage.qi_cichang += trigger.num;
                player.markSkill('qi_cichang');
                player.syncStorage('qi_cichang');
                trigger.nature = 'thunder';
                if (trigger.source == player) {
                    trigger.num = 0;
                }
                else if (trigger.num > 1) {
                    trigger.num--;
                }
            },
            intro: {
                content: "mark",
            },
        },
        qi_cichang1: {
            trigger: {
                player: "damageAfter",
            },
            forced: true,
            filter: function (event, player) {
                if (player.storage.qi_cichang1 && event.nature == 'thunder') return true;
                return false;
            },
            content: function () {
                trigger.num = player.storage.qi_cichang1;
                player.storage.qi_cichang1 = 0;

            },
        },
        qi_huoqi: {
            trigger: {
                player: "useCardToBefore",
            },
            forced: true,
            priority: 9,
            filter: function (event, player) {
                if (event.card.name == 'sha') return true;
            },
            content: function () {
                trigger.card.nature = 'fire';
            },
        },
        qi_lieyan: {
            trigger: {
                global: "damageEnd",
            },
            forced: true,
            group: "qi_lieyan1",
            filter: function (event, player) {
                if (event.source == player && event.player != player && event.card && (event.card.name == 'sha' || event.card.name == 'huogong')) {
                    return true;
                }
                return false;
            },
            intro: {
                content: "mark",
            },
            content: function () {
                trigger.player.storage.qi_lieyan = 2;
                trigger.player.markSkill('qi_lieyan');
                trigger.player.syncStorage('qi_lieyan');
            },
        },
        qi_lieyan1: {
            trigger: {
                global: "phaseBegin",
            },
            forced: true,
            filter: function (event, player) {
                return event.player.storage.qi_lieyan;
            },

            content: function () {
                trigger.source = player;
                trigger.player.loseHp();
                trigger.player.storage.qi_lieyan--;
                trigger.player.syncStorage('qi_lieyan');
                if (trigger.player.storage.qi_lieyan == 0) {
                    trigger.player.unmarkSkill('qi_lieyan');
                }
            },
        },
        qi_fencheng: {
            enable: 'phaseUse',
            usable: 1,
            position: 'he',
            selectCard: 2,
            prompt: '弃置两张牌来对每个人使用一张杀',
            check: function (card) {
                var player = _status.event.player;
                var players = game.filterPlayer();
                for (var i = 0; i < players.length; i++) {
                    if (ai.get.attitude(player, players[i]) > 0 && players[i] != player) {
                        if (players[i].hp < 1) return -1;
                    }
                }
                return 6 - ai.get.value(card);
            },
            ai: {
                order: 10,
                threaten: 1,
                expose: 0.1,
            },
            selectTarget: -1,
            filterTarget: function (card, player, target) {
                return target != player;
            },
            content: function () {
                player.useCard({name: 'sha'}, target, false);
            },
        },
        qi_huoqu: {
            trigger: {
                player: "damageBefore",
            },
            forced: true,
            ai: {
                effect: function (card) {
                    if (get.tag(card, 'fireDamage')) return [0, 2];
                }
            },
            //direct: true,
            filter: function (event) {
                return event.nature == 'fire';
            },
            content: function () {
                trigger.untrigger();
                trigger.finish();
                player.recover(trigger.num);
            },
        },
    },
    translate: {
        qi_leishen: "雷神奇哥",
        qi_wanciwang: "万磁王奇哥",
        qi_huoshen: "火神奇哥",

        qi_tianlei: "天雷",
        qi_chaofeng: "嘲讽",
        qi_qicai: "奇才",
        qi_gongdao: "公道",
        qi_kongci: "控磁",
        qi_cibao: "磁暴",
        qi_zhuzai: "主宰",
        qi_cichang: "磁场",
        qi_cichang1: "磁场1",
        qi_huoqi: "火契",
        qi_lieyan: "烈焰",
        qi_lieyan1: "烈焰1",
        qi_fencheng: "焚城",
        qi_huoqu: "火躯",
        qi_tianlei_info: "每当你使用或打出一张【闪】，可令任意一名角色进行一次判定，若结果为黑桃，其受到两点雷电伤害；若结果为红桃，你回复两点体力；若为梅花或方片，其受到一点雷电伤害，然后你回复一点体力。",
        qi_chaofeng_info: "出牌阶段，你可以指定一名使用【杀】能攻击到你的角色，该角色必须对你使用一张【杀】，若该角色没有【杀】，你弃掉他的一张牌，每回合限一次。",
        qi_qicai_info: "任意一名角色的判定生效前，你可以打出一张牌替换之。",
        qi_gongdao_info: "每当你受到伤害后，你可以获得与伤害值数量相同的闪。",
        qi_kongci_info: "开场和结束时各能发起一次无数量限制的铁索连环。",
        qi_cibao_info: "你可以将磁场存储的电磁随杀打出，此杀视为雷杀。",
        qi_zhuzai_info: "消耗一个电磁来抵挡此次伤害。",
        qi_cichang_info: "每当你受到非火属性的伤害时，获得同数值的电磁；并且当你所受的雷电伤害大于1时将减少1点,对自己造成的伤害为0(铁索传导仍是原始伤害)；普通杀被视为雷杀。",
        qi_huoqi_info: "你的杀视为火杀。",
        qi_lieyan_info: "你的火杀造成伤害后会附上灼烧效果，每回合灼烧1点血，持续两回合，此效果不可叠加",
        qi_fencheng_info: "你可以丢弃两张牌，相当于依次对每个人出了一张杀。",
        qi_huoqu_info: "你免疫一切火伤害，并回复一点血。",
    },
}
