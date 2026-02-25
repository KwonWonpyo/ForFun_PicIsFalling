<script lang="ts">
  interface Props {
    label: string
    preview: string | null
    onupload: (dataUrl: string) => void
  }

  let { label, preview, onupload }: Props = $props()

  function handleFile(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onupload(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }
</script>

<div class="image-uploader">
  <span class="label-text">{label}</span>
  {#if preview}
    <img src={preview} alt="미리보기" class="preview" />
  {/if}
  <label class="upload-btn">
    <input type="file" accept="image/*" onchange={handleFile} />
    <span>이미지 업로드</span>
  </label>
</div>

<style>
  .image-uploader {
    margin-bottom: 8px;
  }

  .label-text {
    font-size: 13px;
    color: #ccc;
    display: block;
    margin-bottom: 4px;
  }

  .preview {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #555;
    margin-bottom: 4px;
    display: block;
  }

  .upload-btn {
    display: inline-block;
    padding: 4px 12px;
    background: #2a3040;
    border: 1px solid #555;
    border-radius: 4px;
    color: #ccc;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .upload-btn:hover {
    background: #3a4050;
  }

  .upload-btn input[type='file'] {
    display: none;
  }
</style>
