import re
import string

def clean_text(text: str) -> str:
    """
    Cleans raw resume or job text while preserving meaningful technical symbols
    like C++, C#, .NET, Node.js.
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Replace URLs
    text = re.sub(r'http\S+|www\.\S+', ' ', text)
    # Replace emails
    text = re.sub(r'\S+@\S+', ' ', text)
    # Replace phone numbers
    text = re.sub(r'\+?\d[\d -]{8,}\d', ' ', text)
    
    # Protect special tech tokens before generic punctuation removal
    text = re.sub(r'(?<![a-zA-Z0-9])C\+\+(?![a-zA-Z0-9])', ' cpp ', text, flags=re.IGNORECASE)
    text = re.sub(r'(?<![a-zA-Z0-9])C#(?![a-zA-Z0-9])', ' csharp ', text, flags=re.IGNORECASE)
    text = re.sub(r'(?<![a-zA-Z0-9])\.NET(?![a-zA-Z0-9])', ' dotnet ', text, flags=re.IGNORECASE)
    text = re.sub(r'(?<![a-zA-Z0-9])Node\.js(?![a-zA-Z0-9])', ' nodejs ', text, flags=re.IGNORECASE)
    text = re.sub(r'(?<![a-zA-Z0-9])Vue\.js(?![a-zA-Z0-9])', ' vuejs ', text, flags=re.IGNORECASE)
    text = re.sub(r'(?<![a-zA-Z0-9])React\.js(?![a-zA-Z0-9])', ' reactjs ', text, flags=re.IGNORECASE)
    
    # Remove HTML tags if present
    text = re.sub(r'<.*?>', ' ', text)
    
    # Replace non-alphanumeric
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    
    # Collapse multiple whitespaces and lowercase
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text

def extract_contact_info(text: str) -> dict:
    """
    Extracts email, phone, and links without privacy violation.
    Includes OCR error tolerance (e.g. user@gmailcom -> user@gmail.com).
    """
    emails = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    
    # Tolerant fallback for OCR artifacts where dot before TLD was omitted or replaced
    if not emails:
        ocr_emails = re.findall(r'[a-zA-Z0-9_.+-]+@(?:gmail|yahoo|outlook|hotmail|icloud|protonmail|live)(?:com|in|org|co|net|edu)', text, re.IGNORECASE)
        for em in ocr_emails:
            fixed = re.sub(r'@(gmail|yahoo|outlook|hotmail|icloud|protonmail|live)(com|in|org|co|net|edu)$', r'@\1.\2', em, flags=re.IGNORECASE)
            emails.append(fixed)

    # Phone numbers: support international and 10-digit formats (+91 9876543210, +1 (555) 123-4567, etc.)
    phones = re.findall(r'(?:\+?91[\s-]?)?[6-9]\d{9}|(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    linkedin = re.findall(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
    github = re.findall(r'(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
    
    return {
        "email": emails[0] if emails else None,
        "phone": phones[0] if phones else None,
        "linkedin": linkedin[0] if linkedin else None,
        "github": github[0] if github else None
    }

def get_text_statistics(text: str) -> dict:
    """
    Calculates character count, word count, line count, and average word length.
    """
    words = re.findall(r'\b\w+\b', text)
    word_count = len(words)
    char_count = len(text)
    avg_word_length = round(sum(len(w) for w in words) / max(word_count, 1), 2)
    lines = [line for line in text.splitlines() if line.strip()]
    
    return {
        "character_count": char_count,
        "word_count": word_count,
        "line_count": len(lines),
        "average_word_length": avg_word_length
    }
