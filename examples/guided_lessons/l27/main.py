from math import sqrt

FEATURES = ["Python", "HTTP", "数据库"]


def embed(text):
    # 固定词频特征，只用于讲清向量，非预训练语义模型。
    return [text.lower().count(word.lower()) for word in FEATURES]


def cosine(a, b):
    if len(a) != len(b):
        raise ValueError("向量维度必须相同")
    length = sqrt(sum(x * x for x in a) * sum(y * y for y in b))
    return sum(x * y for x, y in zip(a, b)) / length if length else 0.0


if __name__ == "__main__":
    print("模型：教学词频-v1；维度：", len(FEATURES))
    docs = ["Python 函数", "HTTP 请求", "数据库 SQL"]
    for query in ["Python", "蟒蛇"]:
        ranked = sorted(
            [(round(cosine(embed(query), embed(doc)), 3), doc) for doc in docs],
            reverse=True,
        )
        print(query, ranked)
