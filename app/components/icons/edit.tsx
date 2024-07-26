export const Edit = ({
  fill = "#4B5563",
  className,
}: {
  fill?: string;
  className?: string;
}) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.54166 1.82243C8.44279 1.82104 7.34797 1.69801 6.24926 1.68458C5.6666 1.67745 5.08801 1.70856 4.51142 1.79448C4.03763 1.86509 3.55972 2.02475 3.15562 2.28585C2.79906 2.51624 2.4989 2.82915 2.2964 3.20329C2.11111 3.54567 2.00213 3.92335 1.94088 4.306C1.87189 4.73692 1.84344 5.17143 1.82324 5.6069C1.80088 6.08887 1.759 6.56923 1.72283 7.05036C1.55748 9.24917 1.4314 11.4687 1.62961 13.6697C1.68049 14.2346 1.75426 14.7988 1.85754 15.3566C1.93183 15.7578 2.01177 16.1497 2.19931 16.5155C2.48105 17.065 2.99982 17.4769 3.5498 17.7363C4.17519 18.0313 4.84633 18.1899 5.52881 18.2831C6.29853 18.3882 7.07191 18.4293 7.84843 18.435C8.56842 18.4403 9.28818 18.4178 10.0077 18.3955C10.5908 18.3774 11.1757 18.3533 11.759 18.3745C12.1811 18.3898 12.6015 18.4125 13.0242 18.4084C13.5932 18.403 14.1584 18.3579 14.7217 18.2777C15.226 18.2059 15.7266 18.0908 16.2019 17.9056C16.6768 17.7205 17.122 17.4872 17.465 17.1009C18.0866 16.4007 18.3375 15.4612 18.4753 14.5562C18.5486 14.0757 18.5967 13.5922 18.6417 13.1084C18.6647 12.8605 18.6823 12.6185 18.6823 12.3693C18.6823 12.0437 18.6823 11.7182 18.6823 11.3927C18.6823 10.8849 18.6823 10.3771 18.6823 9.86926C18.6823 9.57116 18.4335 9.32239 18.1354 9.32239C17.8373 9.32239 17.5885 9.57116 17.5885 9.86926C17.5885 10.7156 17.5885 11.562 17.5885 12.4083C17.5885 12.713 17.5572 13.0126 17.5286 13.3158C17.5008 13.6096 17.4705 13.9032 17.4317 14.1958C17.4382 14.1474 17.4447 14.0989 17.4512 14.0504C17.3918 14.492 17.3126 14.9319 17.1822 15.3585C17.1522 15.4565 17.1186 15.5534 17.0824 15.6492C17.0657 15.6935 16.991 15.8688 17.0713 15.6815C17.0486 15.7347 17.024 15.787 16.9987 15.839C16.9562 15.9264 16.9089 16.0114 16.8583 16.0945C16.8335 16.1353 16.807 16.1752 16.7801 16.2146C16.7666 16.2342 16.7527 16.2535 16.7388 16.2727C16.6607 16.3805 16.8088 16.1851 16.7523 16.2556C16.6936 16.3289 16.6295 16.3976 16.5621 16.463C16.5284 16.4956 16.4931 16.5266 16.4574 16.5569C16.4266 16.583 16.3499 16.6415 16.4945 16.5301C16.4695 16.5493 16.4437 16.5676 16.4178 16.5857C16.3323 16.6453 16.2408 16.6948 16.148 16.7421C16.0972 16.768 16.0456 16.7922 15.9938 16.8159C15.9676 16.8279 15.9412 16.8394 15.9148 16.8508C16.0825 16.778 15.9481 16.8363 15.9111 16.8509C15.4372 17.039 14.9343 17.1496 14.431 17.223C14.3996 17.2276 14.3682 17.2318 14.3368 17.2361C14.3853 17.2296 14.4337 17.2231 14.4822 17.2166C13.9574 17.2859 13.4283 17.3138 12.8992 17.3155C12.4991 17.3169 12.101 17.2914 11.7015 17.2788C11.1103 17.2603 10.5176 17.2859 9.92672 17.3043C8.5184 17.348 7.09594 17.3974 5.69513 17.2117C5.74359 17.2182 5.79205 17.2248 5.84051 17.2313C5.50435 17.186 5.17017 17.126 4.8415 17.0417C4.68834 17.0024 4.53677 16.9569 4.38736 16.9052C4.31845 16.8813 4.25023 16.8556 4.1825 16.8285C4.16586 16.8219 4.14929 16.8151 4.13273 16.8082C4.31621 16.8841 4.23822 16.8529 4.19793 16.8355C4.16035 16.8191 4.1231 16.802 4.08605 16.7846C3.95834 16.7243 3.83449 16.656 3.71558 16.5799C3.66068 16.5447 3.60734 16.5073 3.55511 16.4683C3.49084 16.4203 3.67785 16.5641 3.61496 16.5146C3.60242 16.5047 3.59008 16.4947 3.57773 16.4845C3.54916 16.4612 3.52136 16.4368 3.49392 16.4121C3.44748 16.3703 3.40322 16.3261 3.36054 16.2804C3.33939 16.2578 3.319 16.2345 3.29888 16.2109C3.28886 16.1991 3.2791 16.1872 3.26935 16.1752C3.20226 16.0929 3.35496 16.288 3.3076 16.225C3.23006 16.1219 3.16429 16.0102 3.10929 15.8935C3.0891 15.8507 3.05086 15.7581 3.13271 15.9523C3.12451 15.9328 3.11687 15.9131 3.10933 15.8934C3.09402 15.8534 3.08056 15.8128 3.06795 15.7719C3.02701 15.6394 3.00054 15.502 2.97183 15.3665C2.89873 15.0214 2.84119 14.6732 2.79359 14.3237C2.8001 14.3722 2.80662 14.4206 2.81312 14.4691C2.51861 12.2759 2.61082 10.0427 2.7598 7.84182C2.8009 7.23475 2.84853 6.62815 2.89642 6.02161C2.93427 5.54225 2.93306 5.06186 2.99584 4.58417C2.98933 4.63262 2.98281 4.68108 2.97631 4.72956C3.01267 4.46059 3.06635 4.19385 3.15767 3.93776C3.16677 3.91219 3.17658 3.8869 3.18648 3.86165C3.23267 3.74385 3.12695 3.99585 3.17877 3.88092C3.20617 3.82018 3.23701 3.76104 3.26982 3.70305C3.29927 3.65102 3.33174 3.60075 3.36572 3.55157C3.39271 3.51251 3.47888 3.40491 3.35203 3.56596C3.37285 3.53952 3.3948 3.51397 3.41701 3.48868C3.45769 3.44233 3.50133 3.39872 3.54631 3.35655C3.57189 3.33257 3.59849 3.30971 3.62533 3.28714C3.72398 3.20415 3.5117 3.37059 3.6166 3.29321C3.73443 3.20626 3.86244 3.1338 3.99429 3.07051C4.02426 3.05614 4.05467 3.04272 4.08511 3.02942C3.90381 3.10854 4.05636 3.04272 4.09853 3.02684C4.18445 2.9945 4.27211 2.96688 4.36025 2.94137C4.54525 2.88784 4.73488 2.85737 4.92549 2.83171C4.87703 2.83821 4.82857 2.84473 4.78011 2.85124C6.36254 2.64563 7.95607 2.91421 9.54168 2.9162C9.8398 2.91657 10.0886 2.66716 10.0886 2.36932C10.0885 2.07091 9.83976 1.8228 9.54166 1.82243Z"
      fill={fill}
    />
    <path
      d="M15.1626 2.01455C15.1354 2.06711 15.1052 2.11725 15.0723 2.16641C15.055 2.19225 15.0364 2.21713 15.0178 2.24204C15.1151 2.11164 15.0452 2.20491 15.0229 2.23157C14.9298 2.34315 14.8272 2.44672 14.7242 2.54911C14.5155 2.75664 14.301 2.95815 14.0923 3.16565C13.6551 3.60026 13.2353 4.05194 12.7951 4.48358C12.3525 4.91758 11.9036 5.34256 11.4765 5.79227C11.0625 6.22815 10.6754 6.68959 10.2531 7.11729C9.68437 7.69315 9.06849 8.22432 8.58154 8.87528C8.40906 9.10584 8.24982 9.35164 8.18898 9.63795C8.12152 9.95543 8.155 10.2771 8.11312 10.5963C8.11962 10.5478 8.12615 10.4994 8.13265 10.4509C8.07728 10.8542 7.98164 11.257 7.97853 11.6656C7.97707 11.858 8.08406 12.0409 8.24939 12.1378C8.45005 12.2553 8.75279 12.2361 8.9121 12.0523C8.94419 12.0152 9.004 11.9916 8.83154 12.1114C8.84242 12.1039 8.85451 12.0981 8.8664 12.0923C8.65966 12.1918 8.79447 12.1232 8.86101 12.1064C8.96513 12.0801 9.0724 12.0655 9.17865 12.0511C9.13019 12.0576 9.08173 12.0641 9.03328 12.0706C9.51718 12.006 10.0046 11.9651 10.4838 11.8685C10.5937 11.8463 10.7027 11.82 10.8107 11.7897C10.9251 11.7576 11.0708 11.7233 11.1658 11.6545C11.2791 11.5725 11.3869 11.4826 11.493 11.3916C12.0888 10.8805 12.6615 10.34 13.2279 9.79692C13.5714 9.46762 13.9042 9.12944 14.2233 8.77631C14.634 8.32178 15.0307 7.85465 15.4608 7.41797C15.6777 7.19772 15.9026 6.98586 16.1167 6.7626C16.3215 6.54907 16.5225 6.332 16.7261 6.11729C16.9367 5.89514 17.1508 5.67645 17.3719 5.46467C17.5352 5.30825 17.7116 5.16676 17.8718 5.00664C18.0701 4.80827 18.243 4.58709 18.4117 4.36344C18.5496 4.18057 18.4956 3.84577 18.3262 3.70073C17.617 3.09346 16.8808 2.51815 16.1777 1.90385C15.9535 1.70789 15.6256 1.68254 15.4043 1.90385C15.2043 2.10393 15.1797 2.481 15.4043 2.67725C16.1074 3.29155 16.8436 3.86688 17.5528 4.47412C17.5243 4.25323 17.4958 4.03231 17.4673 3.81141C17.4498 3.8345 17.3676 3.93998 17.4617 3.8195C17.4402 3.8469 17.4184 3.87395 17.3965 3.90096C17.3563 3.95055 17.3148 3.99903 17.2727 4.047C17.1934 4.13743 17.1096 4.2237 17.0231 4.30719C16.8492 4.47506 16.6623 4.62825 16.4891 4.7969C16.0597 5.21506 15.6601 5.66229 15.2434 6.09291C15.0271 6.31641 14.7993 6.52809 14.583 6.75143C14.3696 6.97188 14.1643 7.20006 13.9603 7.42928C13.5761 7.86116 13.1958 8.29612 12.7846 8.70276C12.2464 9.23487 11.6904 9.75012 11.1283 10.2568C10.9366 10.4296 10.7455 10.6051 10.5428 10.7652C10.4907 10.8064 10.6866 10.6564 10.6137 10.7101C10.5501 10.7569 10.787 10.649 10.649 10.6954C10.5449 10.7304 10.4384 10.7583 10.3315 10.7836C10.1091 10.8362 9.88263 10.8714 9.65625 10.9022C9.7047 10.8957 9.75316 10.8891 9.80164 10.8826C9.47595 10.9262 9.14898 10.9588 8.82367 11.0053C8.58851 11.0389 8.30281 11.0895 8.13871 11.2788C8.4499 11.4077 8.76109 11.5366 9.07228 11.6655C9.07334 11.5267 9.08744 11.3889 9.10562 11.2513C9.09912 11.2998 9.09259 11.3482 9.08609 11.3967C9.12638 11.1034 9.18224 10.8128 9.2165 10.5186C9.24185 10.3009 9.22128 10.0809 9.24972 9.86305C9.24322 9.91151 9.23669 9.95996 9.23019 10.0084C9.24138 9.93135 9.25849 9.85639 9.28468 9.78299C9.31375 9.70153 9.22279 9.92362 9.25828 9.84393C9.26621 9.82616 9.27507 9.80881 9.28392 9.79149C9.30634 9.74749 9.33236 9.70534 9.35886 9.66372C9.38525 9.62229 9.41353 9.58209 9.44193 9.54206C9.46589 9.50829 9.58818 9.34815 9.47935 9.48713C9.56896 9.37268 9.66425 9.26272 9.76154 9.15475C10.1529 8.72055 10.5893 8.32944 11.0015 7.91573C11.4253 7.49041 11.8118 7.02893 12.2243 6.59262C12.6503 6.14194 13.0976 5.71522 13.5419 5.28291C13.9926 4.84432 14.4204 4.38301 14.8657 3.93899C15.0821 3.72321 15.3049 3.51411 15.5216 3.2986C15.7408 3.08059 15.9641 2.84303 16.107 2.56653C16.2438 2.30166 16.1777 1.97465 15.9108 1.81829C15.6638 1.67368 15.2993 1.74995 15.1626 2.01455Z"
      fill={fill}
    />
  </svg>
);