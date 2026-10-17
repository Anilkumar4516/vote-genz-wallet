import pytest
import json
import os
from app.services.face_matcher import face_matcher
from app.services.template_crypto import template_crypto

def load_fixture():
    fixture_path = os.path.join(os.path.dirname(__file__), "fixtures", "sample_vectors.json")
    with open(fixture_path, "r") as f:
        return json.load(f)

def test_cosine_similarity_identical_vectors():
    fixtures = load_fixture()
    vec_a = fixtures["identical_citizen_vector_a"]
    vec_b = fixtures["identical_citizen_vector_b"]

    score = face_matcher.cosine_similarity(vec_a, vec_b)
    assert score > 0.99

def test_cosine_similarity_different_vectors():
    fixtures = load_fixture()
    vec_a = fixtures["identical_citizen_vector_a"]
    diff_vec = fixtures["different_citizen_vector"]

    score = face_matcher.cosine_similarity(vec_a, diff_vec)
    assert score < 0.50

def test_match_embeddings_decision():
    fixtures = load_fixture()
    vec_a = fixtures["identical_citizen_vector_a"]
    vec_b = fixtures["identical_citizen_vector_b"]
    diff_vec = fixtures["different_citizen_vector"]

    # Match test
    is_match, score = face_matcher.match_embeddings(vec_a, vec_b)
    assert is_match is True

    # Impersonation test
    is_impersonator_match, diff_score = face_matcher.match_embeddings(vec_a, diff_vec)
    assert is_impersonator_match is False

def test_in_memory_template_encryption_and_decryption():
    raw_template = [0.123, -0.456, 0.789, 0.001]
    encrypted_blob = template_crypto.encrypt_template_for_storage(raw_template)

    assert encrypted_blob != str(raw_template)
    assert ":" in encrypted_blob

    decrypted = template_crypto.decrypt_template_in_memory(encrypted_blob)
    assert len(decrypted) == len(raw_template)
    for original, reconstructed in zip(raw_template, decrypted):
        assert abs(original - reconstructed) < 1e-4
