import datetime
import uuid

from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


def generateSelfSignedCertif():
    print("in generate certif")
    key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )

    # Write our key to disk for safe keeping
    with open("E:\\GL4\\my_keys\\key.pem", "wb") as f:
        f.write(key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.BestAvailableEncryption(b"passphrase"),
        ))
    # generate certif
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, u"TN"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, u"Ariana"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, u"City olympique"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"CA"),
        x509.NameAttribute(NameOID.COMMON_NAME, u"CA.com"),
    ])

    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.datetime.utcnow()
    ).not_valid_after(
        datetime.datetime.utcnow() + datetime.timedelta(days=360)
    ).add_extension(
        x509.SubjectAlternativeName([x509.DNSName(u"localhost")]),
        critical=False,
        # Sign our certificate with our private key
    ).sign(key, hashes.SHA256(), default_backend())
    # Write our certificate out to disk.
    with open("E:\\GL4\\my_keys\\certificate.pem", "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))


def signRequestCSR():
    pem_csr = open("E:\\GL4\\my_keys\\demande.pem", 'rb').read()
    try:
        csr = x509.load_pem_x509_csr(pem_csr, default_backend())
    except Exception:
        raise Exception("CSR presented is not valid.")
    caPem = open("E:\\GL4\\my_keys\\certificate.pem", 'rb').read()
    ca = x509.load_pem_x509_certificate(caPem, default_backend())
    # load key ca
    caKeyPem = open("E:\\GL4\\my_keys\\key.pem", 'rb').read()
    caKey = serialization.load_pem_private_key(caKeyPem, password=b"passphrase", backend=default_backend())

    builder = x509.CertificateBuilder()
    builder = builder.subject_name(csr.subject)
    builder = builder.issuer_name(ca.subject)
    builder = builder.not_valid_before(datetime.datetime.now() - datetime.timedelta(1))
    builder = builder.not_valid_after(datetime.datetime.now() + datetime.timedelta(360))
    builder = builder.public_key(csr.public_key())
    builder = builder.serial_number((int(uuid.uuid4())))

    certificate = builder.sign(
        private_key=caKey,
        algorithm=hashes.SHA256(),
        backend=default_backend()
    )
    with open("E:\\GL4\\my_keys\\newCertif.pem", 'wb') as f:
        f.write(certificate.public_bytes(serialization.Encoding.PEM))
    return certificate.public_bytes(serialization.Encoding.PEM)
