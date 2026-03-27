import { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, ImagePlus, Loader2 } from 'lucide-react';
import { auth, db } from '../firebaseClient';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../i18n/LanguageProvider';
import { translations } from '../i18n/i18n';
import { categories } from '../data/catalog';

interface Props {
  onClose: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 5;

export function PostListingModal({ onClose }: Props) {
  const { lang } = useLanguage();
  const t = translations[lang].postListing;
  const tCat = translations[lang].categories;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('New');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setError('');

    // Check size
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        setError(t.errorImageSize);
        return;
      }
    }

    const combined = [...images, ...files].slice(0, MAX_IMAGES);
    setImages(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    const nextPrev = previews.filter((_, i) => i !== idx);
    setImages(next);
    setPreviews(nextPrev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit triggered');
    setError('');

    // Manual validation
    if (!title.trim() || !description.trim() || !price.trim() || !category || !phone.trim()) {
      const msg = t.errorRequired;
      setError(msg);
      alert('Vui lòng điền đầy đủ thông tin hoặc chọn ảnh!');
      return;
    }

    if (images.length === 0) {
      const msg = t.errorRequired;
      setError(msg);
      alert('Vui lòng điền đầy đủ thông tin hoặc chọn ảnh!');
      return;
    }

    // Auth check
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('Lỗi: Bạn chưa đăng nhập!');
      return;
    }

    setSubmitting(true);
    try {
      // Upload images to ImgBB
      const imageUrls: string[] = [];
      const imgbbKey = import.meta.env.VITE_IMGBB_API_KEY as string;
      for (const file of images) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message ?? 'Image upload failed');
        imageUrls.push(json.data.url as string);
      }

      // Save to Firestore
      await addDoc(collection(db, 'products'), {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        condition,
        sellerPhone: phone.trim(),
        sellerZalo: phone.trim(),
        sellerId: currentUser.uid,
        sellerName: currentUser.displayName ?? currentUser.email ?? '',
        sellerEmail: currentUser.email ?? '',
        images: imageUrls,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
    } catch (error: any) {
      console.error(error);
      const msg = 'Lỗi khi đăng tin: ' + (error?.message ?? 'Unknown error');
      setError(msg);
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={!submitting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
            <div>
              <h2 className="font-bold text-lg" style={{ color: '#1B3A6B' }}>{t.title}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Success State */}
          {success ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-50">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{t.successTitle}</h3>
                <p className="text-sm text-gray-500 max-w-xs">{t.successDesc}</p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: '#1B3A6B' }}
              >
                OK
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.fieldTitle} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.fieldTitlePlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.fieldDesc} <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.fieldDescPlaceholder}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>

              {/* Price & Category row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t.fieldPrice} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={t.fieldPricePlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t.fieldCategory} <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white appearance-none"
                  >
                    <option value="">{t.fieldCategoryPlaceholder}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {tCat[cat.id]?.name ?? cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition & Phone row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t.fieldCondition}
                  </label>
                  <div className="flex gap-2">
                    {(['New', 'Used'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCondition(c)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          condition === c
                            ? 'border-blue-400 text-blue-700 bg-blue-50'
                            : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {c === 'New' ? t.fieldConditionNew : t.fieldConditionUsed}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t.fieldPhone} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.fieldPhonePlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.fieldImages}
                </label>
                <p className="text-xs text-gray-400 mb-2">{t.fieldImagesHint}</p>

                {/* Preview grid */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {previews.map((src, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {previews.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors"
                      >
                        <ImagePlus size={20} />
                      </button>
                    )}
                  </div>
                )}

                {previews.length === 0 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors"
                  >
                    <Upload size={24} />
                    <span className="text-sm">{t.fieldImages}</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#1B3A6B' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t.submitting}
                    </>
                  ) : (
                    t.submit
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
