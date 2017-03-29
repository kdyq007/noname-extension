game.import("extension",{name:"无名扩展",content:function (config,pack){
    
},precontent:function (){
    
},help:{},config:{},package:{
    character:{
        character:{
            test1:["male","wei",4,["去除技能"],[]],
            test2:["male","wei",4,["保留技能","去除技能","test1","qi_xiongsuan","qi_xiongsuan1"],[]],
        },
        translate:{
            test1:"test1",
            test2:"test2",
        },
    },
    card:{
        card:{
        },
        translate:{
        },
        list:[],
    },
    skill:{
        skill:{
            去除技能:{
                enable:"phaseUse",
                filterTarget:function (player,target){
    return player!=target&&target.isAlive},
                content:function (){
    target.clearSkills();
    },
            },
            保留技能:{
                enable:"phaseUse",
                priority:0,
                unique:true,
                selectTarget:1,
                filterTarget:function (player,target){
                return target.isAlive},
                content:function (){
                    console.log(target);
                    target.clearSkills = function (all) {
                        target.popup('无效');
                    };
                    console.log(player);
                    player.loseMaxHp();
                },
            },
            qi_xiongsuan:{
                enable:"phaseUse",
                unique:true,
                mark:true,
                filterCard:true,
                filterTarget:function (card,player,target){
                    //return target.group==player.group&&target!=player;
                    return target.group==player.group;
                },
                prompt:"弃置一张手牌并选择一名与你势力相同的角色",
                init:function (player){
                    player.storage.qi_xiongsuan=false;
                },
                content:function (){
					'step 0'
                    target.damage();
                    player.draw(3);
                    player.storage.qi_xiongsuan=true;
                    player.awakenSkill('qi_xiongsuan');

					var unique_skills = [];
					for (var i=0;i<target.skills.length;i++){
						var _skill = get.info(target.skills[i]);
						if(_skill.unique && _skill.unique==true) unique_skills.push(target.skills[i]);
					}
					player.chooseControl(unique_skills);
					'step 1'
					var _skill = result.control;
					console.log(_skill)
					if(_skill){
						target.markSkill(_skill);
						target.enableSkill(_skill+'_awake');
						target.syncStorage(_skill);
						target.awakenedSkills.remove(_skill);
					}
                },
                intro:{
                    content:"limited",
                },
            },
        },
        translate:{
            去除技能:"去除技能",
            去除技能_info:"去除技能",
            保留技能:"保留技能",
            保留技能_info:"保留技能",
            qi_xiongsuan:"凶算",
            qi_xiongsuan1:"凶算1",
            qi_xiongsuan_info:"凶算",
            qi_xiongsuan1_info:"凶算1",
        },
    },
},files:{"character":["test2.jpg","test1.jpg"],"card":[],"skill":[]}})