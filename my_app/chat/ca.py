import datetime
import uuid

from cryptography import x509
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization


def signRequestCSR(username):
    pem_csr = open("E:\\GL4\\my_keys\\demande_"+username+".pem", 'rb').read()
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
    with open("E:\\GL4\\my_keys\\certif_"+username+".pem", 'wb') as f:
        f.write(certificate.public_bytes(serialization.Encoding.PEM))
    return certificate.public_bytes(serialization.Encoding.PEM).decode("utf-8")
