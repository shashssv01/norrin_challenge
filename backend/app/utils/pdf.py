import io
from pypdf import PdfReader

def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    """
    Extracts text from document bytes based on file extension.
    Supports PDF, TXT, MD.
    """
    ext = filename.split(".")[-1].lower()
    
    if ext == "pdf":
        try:
            pdf_file = io.BytesIO(file_bytes)
            reader = PdfReader(pdf_file)
            text_parts = []
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(f"--- PAGE {i + 1} ---\n{page_text}")
            return "\n\n".join(text_parts)
        except Exception as e:
            raise ValueError(f"Failed to parse PDF file: {str(e)}")
            
    elif ext in ["txt", "md", "markdown", "json"]:
        try:
            return file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                return file_bytes.decode("latin-1")
            except Exception as e:
                raise ValueError(f"Failed to decode text file: {str(e)}")
    else:
        # Fallback to general text decoding
        try:
            return file_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            raise ValueError(f"Unsupported file type: {filename}. Could not parse.")
