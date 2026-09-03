import io
from typing import Union
from pypdf import PdfReader

def extract_text_from_file_bytes(file_bytes: bytes, filename: str) -> str:
    """
    Extract text content from uploaded file bytes (supporting PDF and plain text).
    """
    filename_lower = filename.lower()
    
    if filename_lower.endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            text_pages = []
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_pages.append(extracted)
            full_text = "\n".join(text_pages).strip()
            if full_text:
                return full_text
        except Exception as e:
            print(f"Error parsing PDF with pypdf: {e}")
            # Fallback to UTF-8 decoding in case it was a plain text file saved with .pdf or corrupt
    
    # Try decoding as standard UTF-8 / Latin-1 text
    try:
        return file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            return file_bytes.decode("latin-1")
        except Exception:
            return str(file_bytes)
