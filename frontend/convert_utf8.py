import os
import codecs
import chardet

def convert_to_utf8(file_path):
    try:
        # 检测原始编码
        with open(file_path, 'rb') as f:
            raw_data = f.read()
            if not raw_data:
                return
            result = chardet.detect(raw_data)
            encoding = result['encoding']
            
        if not encoding:
            print(f"无法检测编码: {file_path}")
            return
            
        # 跳过已经是UTF-8的文件
        if encoding.lower() in ['utf-8', 'ascii']:
            print(f"跳过(已是UTF-8): {file_path}")
            return
            
        # 读取内容
        with codecs.open(file_path, 'r', encoding=encoding) as f:
            content = f.read()
            
        # 写入UTF-8
        with codecs.open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"转换成功: {file_path} ({encoding} -> UTF-8)")
        
    except Exception as e:
        print(f"转换失败 {file_path}: {str(e)}")

# 遍历src目录
for root, dirs, files in os.walk('./src'):
    for file in files:
        if file.endswith(('.vue', '.js')):
            file_path = os.path.join(root, file)
            convert_to_utf8(file_path)

print("\n转换完成!")