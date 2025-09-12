import { fakerZH_CN as faker } from '@faker-js/faker'

// 中文职业数据
const chineseJobs = [
  '软件工程师',
  '医生',
  '教师',
  '律师',
  '会计师',
  '销售经理',
  '市场专员',
  '行政助理',
  '人力资源',
  '财务分析师',
  '设计师',
  '工程师',
  '护士',
  '银行职员',
  '公务员',
  '记者',
  '翻译',
  '咨询师',
  '项目经理',
  '产品经理',
  '运营专员',
  '客服代表',
  '技术支持',
  '数据分析师',
  '建筑师',
  '厨师',
  '司机',
  '快递员',
  '保安',
  '清洁工',
  '服务员',
  '收银员',
  '店长',
  '美发师',
  '摄影师',
  '音乐老师',
  '体育教练',
  '导游',
  '房产经纪人',
]

// 详细的家庭生活互动数据
const familyInteractions = {
  夫妻对话: [
    '"{father_name}，今天工作怎么样？" "{mother_name}问道，一边帮他脱外套。"累死了，但是项目进展不错，"他笑着回答。',
    '"{mother_name}，周末我们去哪里玩？" "{father_name}边看电视边问。"要不去公园吧，孩子们也能玩，"她建议道。',
    '"账单又涨了，""{mother_name}皱着眉头看着手机。"{father_name}走过来看了看，"没事，我下个月涨工资了。"',
    '"你今天买菜了吗？""{father_name}问。"买了，今晚吃你最爱的红烧肉，""{mother_name}得意地说。',
    '"孩子最近学习怎么样？""{father_name}关心地问。"还行，就是数学有点跟不上，""{mother_name}有些担心。',
  ],

  亲子互动: [
    '"{child_name}，作业写完了吗？""{mother_name}检查书包时问。"还有一点点，妈妈你别催啦！"孩子撒娇地说。',
    '"{father_name}和{child_name}一起搭乐高，"爸爸，这个怎么装？"孩子求助道。"来，爸爸教你，"父亲耐心地指导。',
    '"今天在学校开心吗？""{father_name}摸摸孩子的头。"开心！老师夸我画画好看，""{child_name}兴奋地分享。',
    '"{child_name}不愿意吃青菜，"{mother_name}苦口婆心："多吃蔬菜身体好，你看超人都吃蔬菜的。"孩子半信半疑地吃了一口。',
    '"爸爸，为什么要上学啊？""{child_name}趴在桌上问。"因为学了知识，以后就能做自己喜欢的事情，""{father_name}温柔地解释。',
  ],

  邻里交往: [
    '楼下张阿姨敲门："孩子们，阿姨做了太多饺子，给你们送点来。""{mother_name}感激地接过："张姐你太客气了！"',
    '隔壁王叔叔在走廊遇到{father_name}："最近工作忙吗？""还好还好，王哥你呢？"两人聊了十分钟工作和孩子。',
    '楼上小李家装修，{mother_name}上去沟通："能不能避开孩子睡觉时间？""当然可以，不好意思打扰了，"对方很配合。',
    '电梯里遇到隔壁小朋友，{child_name}害羞地躲在妈妈身后，{mother_name}鼓励："去和小朋友打招呼啊。"',
    '小区停电，大家都在楼下乘凉，{father_name}和邻居们聊起了股市和房价，{mother_name}则和其他妈妈交流育儿心得。',
  ],

  朋友来访: [
    '{father_name}的大学同学突然来访："老兄，我在附近出差，顺便看看你！""{father_name}惊喜地开门："太好了，快进来！"',
    '{mother_name}的闺蜜带着孩子来玩："孩子们一起玩，咱们聊聊天。""好啊，我刚泡了好茶，"两人坐下开始八卦。',
    '同事李老师来家访："{child_name}在学校表现很好，就是有点内向。"父母认真听着，讨论如何帮助孩子。',
    '{father_name}邀请同事来家里："今天老婆做了拿手菜，一起尝尝。"客人夸赞不已，{mother_name}很开心。',
    '老家亲戚来城里看病，在家里住了一晚："城里变化真大啊！"大家围坐聊家常到很晚。',
  ],

  日常琐事: [
    '早上{child_name}找不到作业本，全家总动员帮忙找，最后在沙发缝里找到了，{mother_name}哭笑不得。',
    '晚饭时停电了，{father_name}找出手电筒，{mother_name}点蜡烛，{child_name}觉得很有趣，说像冒险一样。',
    '家里的洗衣机坏了，{father_name}研究了半天说明书，{mother_name}在旁边指导，最后还是叫了维修师傅。',
    '{mother_name}做饭时忘记关火，烟雾报警器响了，{father_name}和{child_name}急忙跑过来，发现只是烧糊了锅底。',
    '半夜{child_name}发烧，{mother_name}急得不行，{father_name}连夜开车去医院，折腾到凌晨三点才回家。',
  ],

  周末活动: [
    '周六全家去公园，{child_name}要玩秋千，{father_name}推秋千，{mother_name}在旁边拍照："笑一个！"',
    '周日在家包饺子，{child_name}学着包但包得奇形怪状，{father_name}说："没关系，只要有心意就好。"',
    '周末大扫除，{father_name}擦窗户，{mother_name}拖地，{child_name}负责整理玩具，全家分工合作。',
    '周日下午看电影，{child_name}选了动画片，{father_name}偷偷打瞌睡，{mother_name}准备了爆米花和饮料。',
    '周末去超市购物，{child_name}要买零食，{mother_name}说："只能选两样。"最后选了半小时才决定。',
  ],
}

// 中文学历
const chineseEducation = ['博士', '硕士', '本科', '大专', '高中', '初中', '小学']

// 中文兴趣爱好
const chineseHobbies = [
  '读书',
  '旅游',
  '摄影',
  '运动',
  '音乐',
  '电影',
  '美食',
  '游戏',
  '书法',
  '绘画',
  '舞蹈',
  '唱歌',
  '登山',
  '游泳',
  '跑步',
  '瑜伽',
  '钓鱼',
  '园艺',
  '收藏',
  '下棋',
  '麻将',
  '太极',
  '广场舞',
  '烹饪',
  '手工',
  '养花',
  '写作',
  '学习外语',
  '健身',
  '篮球',
  '足球',
  '羽毛球',
  '乒乓球',
  '网球',
  '骑行',
  '滑雪',
  '滑冰',
  '攀岩',
  '潜水',
]

// 中国城市
const chineseCities = [
  '北京市',
  '上海市',
  '广州市',
  '深圳市',
  '杭州市',
  '南京市',
  '成都市',
  '重庆市',
  '武汉市',
  '西安市',
  '天津市',
  '苏州市',
  '长沙市',
  '沈阳市',
  '青岛市',
  '郑州市',
  '大连市',
  '东莞市',
  '宁波市',
  '厦门市',
  '福州市',
  '无锡市',
  '合肥市',
  '昆明市',
  '哈尔滨市',
  '济南市',
  '佛山市',
  '长春市',
  '温州市',
  '石家庄市',
  '南宁市',
  '常州市',
  '泉州市',
  '南昌市',
  '贵阳市',
  '太原市',
  '烟台市',
  '嘉兴市',
  '南通市',
  '金华市',
]

/**
 * 生成个人详细信息
 * @param {string} gender 性别
 * @param {number} age 年龄
 * @returns {Object} 个人信息
 */
function generatePersonDetails(gender, age) {
  const hobbiesCount = faker.number.int({ min: 2, max: 5 })
  const selectedHobbies = faker.helpers.arrayElements(chineseHobbies, hobbiesCount)

  return {
    gender,
    education: faker.helpers.arrayElement(chineseEducation),
    job: age >= 22 ? faker.helpers.arrayElement(chineseJobs) : age >= 16 ? '学生' : '无',
    salary: age >= 22 ? faker.number.int({ min: 3000, max: 50000 }) : 0,
    hobbies: selectedHobbies,
    personality: faker.helpers.arrayElements(
      [
        '开朗',
        '内向',
        '幽默',
        '严谨',
        '温和',
        '活泼',
        '稳重',
        '乐观',
        '细心',
        '耐心',
        '热情',
        '理性',
        '感性',
        '独立',
        '责任心强',
      ],
      faker.number.int({ min: 2, max: 4 }),
    ),
    health_status: faker.helpers.arrayElement(['优秀', '良好', '一般', '需关注']),
    id_number: faker.string.numeric(18), // 模拟身份证号
  }
}

// 生成一周生活记录
function generateWeeklyLife(familyData) {
  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const weeklyRecord = {}

  // 获取家庭成员姓名
  const fatherName = familyData.father.name
  const motherName = familyData.mother.name
  const childName = familyData.children.length > 0 ? familyData.children[0].name : '孩子'

  weekdays.forEach((day) => {
    const dailyEvents = []

    // 早餐场景 (每天都有，包含对话)
    const breakfastFoods = [
      '小笼包和豆浆',
      '稀饭配咸菜',
      '面包牛奶',
      '蒸蛋羹',
      '煎饼果子',
      '粥和包子',
      '面条',
    ]
    const breakfast = faker.helpers.arrayElement(breakfastFoods)
    const breakfastDialogues = [
      `${motherName}准备了${breakfast}，${fatherName}边吃边说："这个味道真不错。"${childName}挑食地说："我不要吃这个。"`,
      `早餐时${childName}问："妈妈，今天学校有什么活动吗？"${motherName}一边盛${breakfast}一边回答："有体育课，记得带运动鞋。"`,
      `${fatherName}匆忙地吃着${breakfast}："我今天有重要会议，可能会晚回来。"${motherName}关心地说："注意身体，别太累了。"`,
    ]
    dailyEvents.push(faker.helpers.arrayElement(breakfastDialogues))

    // 夫妻对话 (60%概率)
    if (faker.helpers.maybe(() => true, { probability: 0.6 })) {
      const dialogue = faker.helpers
        .arrayElement(familyInteractions.夫妻对话)
        .replace(/\{father_name\}/g, fatherName)
        .replace(/\{mother_name\}/g, motherName)
      dailyEvents.push(dialogue)
    }

    // 亲子互动 (80%概率)
    if (faker.helpers.maybe(() => true, { probability: 0.8 })) {
      const interaction = faker.helpers
        .arrayElement(familyInteractions.亲子互动)
        .replace(/\{father_name\}/g, fatherName)
        .replace(/\{mother_name\}/g, motherName)
        .replace(/\{child_name\}/g, childName)
      dailyEvents.push(interaction)
    }

    // 邻里交往 (30%概率)
    if (faker.helpers.maybe(() => true, { probability: 0.3 })) {
      const neighbor = faker.helpers
        .arrayElement(familyInteractions.邻里交往)
        .replace(/\{father_name\}/g, fatherName)
        .replace(/\{mother_name\}/g, motherName)
        .replace(/\{child_name\}/g, childName)
      dailyEvents.push(neighbor)
    }

    // 朋友来访 (周末40%概率，工作日15%概率)
    const visitProbability = ['周六', '周日'].includes(day) ? 0.4 : 0.15
    if (faker.helpers.maybe(() => true, { probability: visitProbability })) {
      const visit = faker.helpers
        .arrayElement(familyInteractions.朋友来访)
        .replace(/\{father_name\}/g, fatherName)
        .replace(/\{mother_name\}/g, motherName)
        .replace(/\{child_name\}/g, childName)
      dailyEvents.push(visit)
    }

    // 日常琐事 (40%概率)
    if (faker.helpers.maybe(() => true, { probability: 0.4 })) {
      const chore = faker.helpers
        .arrayElement(familyInteractions.日常琐事)
        .replace(/\{father_name\}/g, fatherName)
        .replace(/\{mother_name\}/g, motherName)
        .replace(/\{child_name\}/g, childName)
      dailyEvents.push(chore)
    }

    // 周末特殊活动
    if (['周六', '周日'].includes(day)) {
      if (faker.helpers.maybe(() => true, { probability: 0.7 })) {
        const weekend = faker.helpers
          .arrayElement(familyInteractions.周末活动)
          .replace(/\{father_name\}/g, fatherName)
          .replace(/\{mother_name\}/g, motherName)
          .replace(/\{child_name\}/g, childName)
        dailyEvents.push(weekend)
      }
    }

    // 晚餐场景 (每天都有)
    const dinnerFoods = ['清蒸鱼', '红烧排骨', '麻婆豆腐', '宫保鸡丁', '糖醋里脊', '青椒肉丝']
    const dinner = faker.helpers.arrayElement(dinnerFoods)
    const dinnerDialogues = [
      `晚餐${motherName}做了${dinner}，${fatherName}夸赞道："老婆手艺真好！"${childName}开心地说："我最喜欢妈妈做的菜了。"`,
      `吃${dinner}时，${childName}突然问："爸爸妈妈，你们是怎么认识的？"${fatherName}和${motherName}相视而笑，开始讲起恋爱故事。`,
      `${motherName}盛${dinner}时说："今天这道菜有点咸了。"${fatherName}安慰道："没关系，我觉得刚好。"${childName}调皮地说："我觉得有点咸。"`,
    ]
    dailyEvents.push(faker.helpers.arrayElement(dinnerDialogues))

    weeklyRecord[day] = dailyEvents
  })

  return weeklyRecord
}

/**
 * 生成单个家庭数据
 * @param {Object} config 配置参数
 * @returns {Object} 家庭数据
 */
export function generateFamilyData(config = {}) {
  const {
    fatherAgeMin = 30,
    fatherAgeMax = 50,
    motherAgeMin = 28,
    motherAgeMax = 48,
    childrenCount = 2,
  } = config

  const father_age = faker.number.int({ min: fatherAgeMin, max: fatherAgeMax })
  const mother_age = faker.number.int({ min: motherAgeMin, max: motherAgeMax })
  const city = faker.helpers.arrayElement(chineseCities)

  // 计算家庭收入
  const father_details = generatePersonDetails('男', father_age)
  const mother_details = generatePersonDetails('女', mother_age)
  const family_income = father_details.salary + mother_details.salary

  // 先生成基本家庭信息
  const familyData = {
    family_id: faker.string.uuid(),

    // 父亲信息
    father: {
      name: faker.person.fullName(),
      age: father_age,
      ...father_details,
    },

    // 母亲信息
    mother: {
      name: faker.person.fullName(),
      age: mother_age,
      ...mother_details,
    },

    // 孩子信息
    children: Array.from({ length: childrenCount }, () => {
      const child_age = faker.number.int({ min: 1, max: 18 })
      const child_gender = faker.helpers.arrayElement(['男', '女'])

      return {
        name: faker.person.fullName(),
        age: child_age,
        ...generatePersonDetails(child_gender, child_age),
        school_grade:
          child_age >= 6
            ? child_age <= 12
              ? `小学${child_age - 5}年级`
              : child_age <= 15
                ? `初中${child_age - 12}年级`
                : child_age <= 18
                  ? `高中${child_age - 15}年级`
                  : '毕业'
            : '学前',
      }
    }),

    // 家庭信息
    family_info: {
      city: city,
      district: faker.location.streetAddress(),
      detailed_address: faker.location.streetAddress(true),
      housing_type: faker.helpers.arrayElement(['公寓', '别墅', '联排', '平房', '复式']),
      housing_area: faker.number.int({ min: 60, max: 300 }),
      family_income: family_income,
      car_count: faker.number.int({ min: 0, max: 3 }),
      pets:
        faker.helpers.maybe(
          () =>
            faker.helpers.arrayElements(
              ['狗', '猫', '鸟', '鱼', '仓鼠'],
              faker.number.int({ min: 1, max: 2 }),
            ),
          { probability: 0.4 },
        ) || [],
      family_motto: faker.helpers.arrayElement([
        '家和万事兴',
        '诚信待人',
        '勤俭持家',
        '团结友爱',
        '积极向上',
        '健康快乐',
        '知识改变命运',
        '和谐美满',
        '互相关爱',
        '努力奋斗',
      ]),
    },

    // 联系方式
    contact: {
      phone: faker.phone.number(),
      email: faker.internet.email(),
      wechat: faker.string.alphanumeric(8),
      emergency_contact: faker.person.fullName(),
      emergency_phone: faker.phone.number(),
    },

    // 生成时间
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // 基于已生成的家庭信息生成一周生活记录
  familyData.weekly_life = generateWeeklyLife(familyData)

  return familyData
}

/**
 * 批量生成家庭数据
 * @param {number} count 生成数量
 * @param {Object} config 配置参数
 * @returns {Array} 家庭数据数组
 */
export function generateBatchFamilyData(count, config) {
  return Array.from({ length: count }, () => generateFamilyData(config))
}
