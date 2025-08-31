import os
import sys
import codecs
import chardet

def convert_to_utf8(file_path, extensions):
    """
    将给定文件路径的文件转换为UTF-8编码。
    它会检测原始编码，如果不是UTF-8，则进行转换。
    """
    # 检查文件扩展名是否在我们的目标列表中
    if not any(file_path.endswith(ext) for ext in extensions):
        return

    try:
        # 以二进制模式读取文件以检测编码
        with open(file_path, 'rb') as f:
            raw_data = f.read()
            if not raw_data:
                return  # 跳过空文件

        # 检测文件编码
        result = chardet.detect(raw_data)
        encoding = result['encoding']
        
        # 如果已经是UTF-8或ASCII，则无需转换
        if encoding and encoding.lower() in ['utf-8', 'ascii']:
            # print(f"跳过 (已是UTF-8): {file_path}")
            return

        # chardet有时会将GBK误判为'charmap'或无法确定。在这种情况下，我们假定为'gbk'。
        if not encoding or encoding.lower() == 'charmap':
            encoding = 'gbk'
        
        # 使用检测到的编码读取文件内容
        # 'replace'会替换无法解码的字符
        with codecs.open(file_path, 'r', encoding=encoding, errors='replace') as f:
            content = f.read()
        
        # 以UTF-8编码写回文件
        with codecs.open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"转换成功: {file_path} ({encoding} -> UTF-8)")

    except UnicodeDecodeError:
        # 如果使用检测到的编码解码失败，尝试强制使用'gbk'
        try:
            with codecs.open(file_path, 'r', encoding='gbk', errors='replace') as f:
                content = f.read()
            
            with codecs.open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"转换成功 (强制GBK): {file_path} (GBK -> UTF-8)")
        except Exception as e:
            print(f"转换失败 (强制GBK后): {file_path}: {e}")
    except Exception as e:
        print(f"转换时发生未知错误: {file_path}: {e}")

def main():
    """
    主函数，用于扫描指定目录并转换文件编码。
    """
    # 定义要处理的文件扩展名
    extensions = [
        # 前端文件
        '.vue', '.js', '.html', '.json', '.md', '.txt', '.cjs', 
        # 后端文件
        '.java', '.xml', '.properties', '.sql'
    ]
    
    try:
        # 获取当前脚本所在的目录
        base_dir = os.path.dirname(os.path.abspath(__file__))
        # 项目根目录假定为脚本所在目录的上级
        project_root = os.path.dirname(base_dir)
    except NameError:
        # 如果在某些环境中 __file__ 未定义，则使用当前工作目录
        project_root = os.getcwd()

    # 定义要扫描的目录
    dirs_to_scan = [
        os.path.join(project_root, 'frontend'),
        os.path.join(project_root, 'backend')
    ]

    # 定义要排除的目录和文件
    excluded_dirs = ['.git', 'target', 'node_modules', 'dist', 'bin', '__pycache__']
    excluded_files = ['vite.config.js.timestamp']

    for target_dir in dirs_to_scan:
        if not os.path.isdir(target_dir):
            print(f"目录不存在，跳过: {target_dir}")
            continue
        
        print(f"\n--- 开始扫描目录: {target_dir} ---")
        # 遍历目录
        for root, dirs, files in os.walk(target_dir):
            # 从遍历中排除指定目录
            dirs[:] = [d for d in dirs if d not in excluded_dirs]
            
            for file in files:
                # 排除指定文件
                if file in excluded_files:
                    continue
                
                file_path = os.path.join(root, file)
                convert_to_utf8(file_path, extensions)

    print("\n--- 所有转换完成! ---")

if __name__ == "__main__":
    main()
