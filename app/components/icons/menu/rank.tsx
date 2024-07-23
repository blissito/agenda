export const Rank = ({
  fill = "#11151A",
  className,
}: {
  fill?: string;
  className?: string;
}) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.1697 17.2795C3.07963 17.2795 2.99324 17.3153 2.92955 17.379C2.86586 17.4427 2.83008 17.5291 2.83008 17.6191V17.928C2.83008 18.018 2.86586 18.1044 2.92955 18.1681C2.99324 18.2318 3.07963 18.2676 3.1697 18.2676C3.25977 18.2676 3.34616 18.2318 3.40985 18.1681C3.47354 18.1044 3.50932 18.018 3.50932 17.928V17.6191C3.50932 17.5291 3.47354 17.4427 3.40985 17.379C3.34616 17.3153 3.25977 17.2795 3.1697 17.2795ZM3.1697 18.8907C3.07963 18.8907 2.99324 18.9265 2.92955 18.9902C2.86586 19.0539 2.83008 19.1402 2.83008 19.2303V20.8424C2.83008 20.9325 2.86586 21.0188 2.92955 21.0825C2.99324 21.1462 3.07963 21.182 3.1697 21.182C3.25977 21.182 3.34616 21.1462 3.40985 21.0825C3.47354 21.0188 3.50932 20.9325 3.50932 20.8424V19.2303C3.50932 19.1402 3.47354 19.0539 3.40985 18.9902C3.34616 18.9265 3.25977 18.8907 3.1697 18.8907ZM13.8868 16.5369C13.7968 16.5369 13.7104 16.5727 13.6467 16.6363C13.583 16.7 13.5472 16.7864 13.5472 16.8765V20.8419C13.5472 20.932 13.583 21.0184 13.6467 21.0821C13.7104 21.1458 13.7968 21.1816 13.8868 21.1816C13.9769 21.1816 14.0633 21.1458 14.127 21.0821C14.1907 21.0184 14.2265 20.932 14.2265 20.8419V16.877C14.2265 16.7869 14.1907 16.7005 14.127 16.6368C14.0633 16.5731 13.9769 16.5369 13.8868 16.5369ZM13.8868 14.2324C13.7968 14.2324 13.7104 14.2682 13.6467 14.3319C13.583 14.3956 13.5472 14.482 13.5472 14.572V15.556C13.5472 15.6461 13.583 15.7325 13.6467 15.7962C13.7104 15.8599 13.7968 15.8957 13.8868 15.8957C13.9769 15.8957 14.0633 15.8599 14.127 15.7962C14.1907 15.7325 14.2265 15.6461 14.2265 15.556V14.572C14.2265 14.482 14.1907 14.3956 14.127 14.3319C14.0633 14.2682 13.9769 14.2324 13.8868 14.2324ZM20.8301 17.28C20.74 17.28 20.6536 17.3158 20.5899 17.3794C20.5262 17.4431 20.4905 17.5295 20.4905 17.6196V17.9284C20.4905 18.0185 20.5262 18.1049 20.5899 18.1686C20.6536 18.2323 20.74 18.268 20.8301 18.268C20.9202 18.268 21.0065 18.2323 21.0702 18.1686C21.1339 18.1049 21.1697 18.0185 21.1697 17.9284V17.6196C21.1697 17.5295 21.1339 17.4431 21.0702 17.3794C21.0065 17.3158 20.9202 17.28 20.8301 17.28ZM20.8301 18.8911C20.74 18.8911 20.6536 18.9269 20.5899 18.9906C20.5262 19.0543 20.4905 19.1407 20.4905 19.2308V20.8428C20.4905 20.9329 20.5262 21.0193 20.5899 21.083C20.6536 21.1467 20.74 21.1825 20.8301 21.1825C20.9202 21.1825 21.0065 21.1467 21.0702 21.083C21.1339 21.0193 21.1697 20.9329 21.1697 20.8428V19.2308C21.1697 19.1407 21.1339 19.0543 21.0702 18.9906C21.0065 18.9269 20.9202 18.8911 20.8301 18.8911Z"
      fill={fill}
    />
    <mask
      id="path-2-outside-1_421_1468"
      maskUnits="userSpaceOnUse"
      x="0.245117"
      y="0.458984"
      width="23"
      height="23"
      fill="black"
    >
      <rect fill="white" x="0.245117" y="0.458984" width="23" height="23" />
      <path d="M21.0564 15.4673H15.8113V13.2127C15.8108 12.7625 15.6318 12.3308 15.3134 12.0125C14.9951 11.6941 14.5634 11.515 14.1132 11.5146H9.88648C9.43626 11.515 9.00461 11.6941 8.68626 12.0125C8.3679 12.3308 8.18884 12.7625 8.18836 13.2127V15.4673H2.94323C2.49301 15.4678 2.06137 15.6469 1.74301 15.9652C1.42466 16.2836 1.2456 16.7152 1.24512 17.1654V22.1995C1.24512 22.387 1.39727 22.5392 1.58474 22.5392H22.4149C22.505 22.5392 22.5914 22.5034 22.6551 22.4397C22.7188 22.376 22.7546 22.2896 22.7546 22.1995V17.1659C22.7541 16.7157 22.575 16.284 22.2567 15.9657C21.9383 15.6473 21.5067 15.4678 21.0564 15.4673ZM1.92436 17.1654C1.92436 16.6039 2.38172 16.1466 2.94323 16.1466H8.18836V21.8599H1.92436V17.1654ZM8.86761 15.8069V13.2127C8.86761 12.6512 9.32497 12.1938 9.88648 12.1938H14.1132C14.6747 12.1938 15.1321 12.6512 15.1321 13.2127V21.8599H8.86761V15.8069ZM22.0753 21.8599H15.8113V16.147H21.0564C21.6179 16.147 22.0753 16.6044 22.0753 17.1659V21.8599ZM10.4032 7.53871L10.1396 9.0575C10.1288 9.11985 10.1357 9.18396 10.1594 9.24261C10.1832 9.30126 10.2228 9.35212 10.2739 9.38945C10.325 9.42678 10.3855 9.44911 10.4485 9.4539C10.5116 9.4587 10.5748 9.44578 10.6309 9.4166L12.003 8.70113L13.3678 9.41615C13.424 9.44563 13.4873 9.45876 13.5505 9.45403C13.6138 9.44931 13.6744 9.42693 13.7256 9.38943C13.7768 9.35212 13.8166 9.30121 13.8403 9.24246C13.8641 9.18372 13.8709 9.11949 13.8601 9.05705L13.5965 7.53871L14.7037 6.45735C14.7494 6.41319 14.7818 6.35706 14.7971 6.29538C14.8124 6.23369 14.81 6.16894 14.7903 6.10853C14.7706 6.04812 14.7342 5.99448 14.6854 5.95375C14.6366 5.91301 14.5774 5.88683 14.5144 5.87818L12.9902 5.65947L12.3082 4.27562C12.2801 4.2189 12.2367 4.17114 12.183 4.13771C12.1292 4.10427 12.0672 4.08648 12.0039 4.08633H12.0035C11.9402 4.08629 11.8782 4.10391 11.8245 4.13719C11.7707 4.17047 11.7273 4.2181 11.6992 4.27471L11.0104 5.65947L9.48527 5.87818C9.4224 5.88699 9.36326 5.91326 9.31458 5.95402C9.26591 5.99477 9.22965 6.04837 9.20993 6.10871C9.1902 6.16905 9.18781 6.23372 9.20303 6.29536C9.21824 6.35699 9.25045 6.41312 9.29599 6.45735L10.4032 7.53871ZM11.283 6.30656C11.3375 6.29872 11.3892 6.27777 11.4338 6.24551C11.4783 6.21325 11.5144 6.17064 11.5389 6.12135L12.0021 5.19124L12.4599 6.12045C12.4844 6.16993 12.5206 6.2127 12.5653 6.24505C12.61 6.2774 12.662 6.29836 12.7167 6.30611L13.736 6.45282L12.9938 7.17781C12.9543 7.2163 12.9248 7.26385 12.9078 7.31632C12.8909 7.36879 12.887 7.42461 12.8964 7.47894L13.073 8.49509L12.161 8.01735C12.1125 7.99178 12.0586 7.97837 12.0037 7.9783C11.9489 7.97822 11.8949 7.99147 11.8463 8.0169L10.9262 8.4969L11.1028 7.47848C11.1122 7.42423 11.1083 7.36849 11.0913 7.31609C11.0744 7.2637 11.0449 7.21623 11.0054 7.17781L10.2637 6.45282L11.283 6.30656ZM7.82021 4.44724C7.88206 4.51269 7.96738 4.5509 8.0574 4.55344C8.14742 4.55599 8.23476 4.52267 8.30021 4.46082C8.36566 4.39897 8.40387 4.31366 8.40642 4.22364C8.40896 4.13362 8.37565 4.04628 8.3138 3.98082L7.58791 3.21282C7.5251 3.15106 7.44077 3.11608 7.35269 3.11525C7.2646 3.11441 7.17963 3.14779 7.11566 3.20836C7.05169 3.26892 7.01372 3.35194 7.00974 3.43994C7.00576 3.52794 7.03609 3.61405 7.09432 3.68014L7.82021 4.44724ZM10.2655 2.90626C10.2764 2.94952 10.2957 2.99021 10.3224 3.026C10.349 3.06179 10.3824 3.09199 10.4207 3.11487C10.4981 3.16106 10.5907 3.17464 10.678 3.1526C10.7213 3.14169 10.762 3.12236 10.7978 3.09572C10.8336 3.06909 10.8638 3.03566 10.8866 2.99735C10.9095 2.95905 10.9246 2.91661 10.9311 2.87246C10.9376 2.82832 10.9353 2.78333 10.9244 2.74007L10.6649 1.71486C10.6424 1.62791 10.5865 1.55335 10.5093 1.50732C10.4322 1.4613 10.34 1.44752 10.2528 1.46898C10.1654 1.49108 10.0903 1.54701 10.0441 1.62446C9.99794 1.7019 9.98439 1.79453 10.0065 1.88196L10.2655 2.90626ZM13.3212 3.1526C13.4086 3.17455 13.5011 3.16093 13.5784 3.11475C13.6557 3.06857 13.7116 2.99358 13.7337 2.90626L13.9932 1.88196C14.0153 1.79459 14.0018 1.70202 13.9557 1.62459C13.9096 1.54715 13.8346 1.49118 13.7473 1.46898C13.66 1.44738 13.5677 1.4611 13.4905 1.50713C13.4133 1.55317 13.3573 1.62781 13.3348 1.71486L13.0753 2.74007C13.0534 2.82732 13.0669 2.91971 13.113 2.99697C13.1591 3.07422 13.234 3.13003 13.3212 3.15215V3.1526ZM15.9327 4.55365C15.9789 4.55364 16.0246 4.5442 16.067 4.5259C16.1095 4.5076 16.1477 4.48083 16.1795 4.44724L16.9053 3.68014C16.9673 3.61469 17.0007 3.5273 16.9983 3.4372C16.9958 3.3471 16.9577 3.26166 16.8922 3.19969C16.8268 3.13772 16.7394 3.10429 16.6493 3.10675C16.5592 3.10922 16.4737 3.14737 16.4118 3.21282L15.6859 3.98128C15.6404 4.02955 15.6101 4.09006 15.5987 4.15535C15.5872 4.22064 15.5951 4.28786 15.6214 4.34871C15.6477 4.40956 15.6912 4.46139 15.7466 4.49781C15.802 4.53423 15.8664 4.55364 15.9327 4.55365Z" />
    </mask>
    <path
      d="M21.0564 15.4673H15.8113V13.2127C15.8108 12.7625 15.6318 12.3308 15.3134 12.0125C14.9951 11.6941 14.5634 11.515 14.1132 11.5146H9.88648C9.43626 11.515 9.00461 11.6941 8.68626 12.0125C8.3679 12.3308 8.18884 12.7625 8.18836 13.2127V15.4673H2.94323C2.49301 15.4678 2.06137 15.6469 1.74301 15.9652C1.42466 16.2836 1.2456 16.7152 1.24512 17.1654V22.1995C1.24512 22.387 1.39727 22.5392 1.58474 22.5392H22.4149C22.505 22.5392 22.5914 22.5034 22.6551 22.4397C22.7188 22.376 22.7546 22.2896 22.7546 22.1995V17.1659C22.7541 16.7157 22.575 16.284 22.2567 15.9657C21.9383 15.6473 21.5067 15.4678 21.0564 15.4673ZM1.92436 17.1654C1.92436 16.6039 2.38172 16.1466 2.94323 16.1466H8.18836V21.8599H1.92436V17.1654ZM8.86761 15.8069V13.2127C8.86761 12.6512 9.32497 12.1938 9.88648 12.1938H14.1132C14.6747 12.1938 15.1321 12.6512 15.1321 13.2127V21.8599H8.86761V15.8069ZM22.0753 21.8599H15.8113V16.147H21.0564C21.6179 16.147 22.0753 16.6044 22.0753 17.1659V21.8599ZM10.4032 7.53871L10.1396 9.0575C10.1288 9.11985 10.1357 9.18396 10.1594 9.24261C10.1832 9.30126 10.2228 9.35212 10.2739 9.38945C10.325 9.42678 10.3855 9.44911 10.4485 9.4539C10.5116 9.4587 10.5748 9.44578 10.6309 9.4166L12.003 8.70113L13.3678 9.41615C13.424 9.44563 13.4873 9.45876 13.5505 9.45403C13.6138 9.44931 13.6744 9.42693 13.7256 9.38943C13.7768 9.35212 13.8166 9.30121 13.8403 9.24246C13.8641 9.18372 13.8709 9.11949 13.8601 9.05705L13.5965 7.53871L14.7037 6.45735C14.7494 6.41319 14.7818 6.35706 14.7971 6.29538C14.8124 6.23369 14.81 6.16894 14.7903 6.10853C14.7706 6.04812 14.7342 5.99448 14.6854 5.95375C14.6366 5.91301 14.5774 5.88683 14.5144 5.87818L12.9902 5.65947L12.3082 4.27562C12.2801 4.2189 12.2367 4.17114 12.183 4.13771C12.1292 4.10427 12.0672 4.08648 12.0039 4.08633H12.0035C11.9402 4.08629 11.8782 4.10391 11.8245 4.13719C11.7707 4.17047 11.7273 4.2181 11.6992 4.27471L11.0104 5.65947L9.48527 5.87818C9.4224 5.88699 9.36326 5.91326 9.31458 5.95402C9.26591 5.99477 9.22965 6.04837 9.20993 6.10871C9.1902 6.16905 9.18781 6.23372 9.20303 6.29536C9.21824 6.35699 9.25045 6.41312 9.29599 6.45735L10.4032 7.53871ZM11.283 6.30656C11.3375 6.29872 11.3892 6.27777 11.4338 6.24551C11.4783 6.21325 11.5144 6.17064 11.5389 6.12135L12.0021 5.19124L12.4599 6.12045C12.4844 6.16993 12.5206 6.2127 12.5653 6.24505C12.61 6.2774 12.662 6.29836 12.7167 6.30611L13.736 6.45282L12.9938 7.17781C12.9543 7.2163 12.9248 7.26385 12.9078 7.31632C12.8909 7.36879 12.887 7.42461 12.8964 7.47894L13.073 8.49509L12.161 8.01735C12.1125 7.99178 12.0586 7.97837 12.0037 7.9783C11.9489 7.97822 11.8949 7.99147 11.8463 8.0169L10.9262 8.4969L11.1028 7.47848C11.1122 7.42423 11.1083 7.36849 11.0913 7.31609C11.0744 7.2637 11.0449 7.21623 11.0054 7.17781L10.2637 6.45282L11.283 6.30656ZM7.82021 4.44724C7.88206 4.51269 7.96738 4.5509 8.0574 4.55344C8.14742 4.55599 8.23476 4.52267 8.30021 4.46082C8.36566 4.39897 8.40387 4.31366 8.40642 4.22364C8.40896 4.13362 8.37565 4.04628 8.3138 3.98082L7.58791 3.21282C7.5251 3.15106 7.44077 3.11608 7.35269 3.11525C7.2646 3.11441 7.17963 3.14779 7.11566 3.20836C7.05169 3.26892 7.01372 3.35194 7.00974 3.43994C7.00576 3.52794 7.03609 3.61405 7.09432 3.68014L7.82021 4.44724ZM10.2655 2.90626C10.2764 2.94952 10.2957 2.99021 10.3224 3.026C10.349 3.06179 10.3824 3.09199 10.4207 3.11487C10.4981 3.16106 10.5907 3.17464 10.678 3.1526C10.7213 3.14169 10.762 3.12236 10.7978 3.09572C10.8336 3.06909 10.8638 3.03566 10.8866 2.99735C10.9095 2.95905 10.9246 2.91661 10.9311 2.87246C10.9376 2.82832 10.9353 2.78333 10.9244 2.74007L10.6649 1.71486C10.6424 1.62791 10.5865 1.55335 10.5093 1.50732C10.4322 1.4613 10.34 1.44752 10.2528 1.46898C10.1654 1.49108 10.0903 1.54701 10.0441 1.62446C9.99794 1.7019 9.98439 1.79453 10.0065 1.88196L10.2655 2.90626ZM13.3212 3.1526C13.4086 3.17455 13.5011 3.16093 13.5784 3.11475C13.6557 3.06857 13.7116 2.99358 13.7337 2.90626L13.9932 1.88196C14.0153 1.79459 14.0018 1.70202 13.9557 1.62459C13.9096 1.54715 13.8346 1.49118 13.7473 1.46898C13.66 1.44738 13.5677 1.4611 13.4905 1.50713C13.4133 1.55317 13.3573 1.62781 13.3348 1.71486L13.0753 2.74007C13.0534 2.82732 13.0669 2.91971 13.113 2.99697C13.1591 3.07422 13.234 3.13003 13.3212 3.15215V3.1526ZM15.9327 4.55365C15.9789 4.55364 16.0246 4.5442 16.067 4.5259C16.1095 4.5076 16.1477 4.48083 16.1795 4.44724L16.9053 3.68014C16.9673 3.61469 17.0007 3.5273 16.9983 3.4372C16.9958 3.3471 16.9577 3.26166 16.8922 3.19969C16.8268 3.13772 16.7394 3.10429 16.6493 3.10675C16.5592 3.10922 16.4737 3.14737 16.4118 3.21282L15.6859 3.98128C15.6404 4.02955 15.6101 4.09006 15.5987 4.15535C15.5872 4.22064 15.5951 4.28786 15.6214 4.34871C15.6477 4.40956 15.6912 4.46139 15.7466 4.49781C15.802 4.53423 15.8664 4.55364 15.9327 4.55365Z"
      fill={fill}
    />
    <path
      d="M21.0564 15.4673H15.8113V13.2127C15.8108 12.7625 15.6318 12.3308 15.3134 12.0125C14.9951 11.6941 14.5634 11.515 14.1132 11.5146H9.88648C9.43626 11.515 9.00461 11.6941 8.68626 12.0125C8.3679 12.3308 8.18884 12.7625 8.18836 13.2127V15.4673H2.94323C2.49301 15.4678 2.06137 15.6469 1.74301 15.9652C1.42466 16.2836 1.2456 16.7152 1.24512 17.1654V22.1995C1.24512 22.387 1.39727 22.5392 1.58474 22.5392H22.4149C22.505 22.5392 22.5914 22.5034 22.6551 22.4397C22.7188 22.376 22.7546 22.2896 22.7546 22.1995V17.1659C22.7541 16.7157 22.575 16.284 22.2567 15.9657C21.9383 15.6473 21.5067 15.4678 21.0564 15.4673ZM1.92436 17.1654C1.92436 16.6039 2.38172 16.1466 2.94323 16.1466H8.18836V21.8599H1.92436V17.1654ZM8.86761 15.8069V13.2127C8.86761 12.6512 9.32497 12.1938 9.88648 12.1938H14.1132C14.6747 12.1938 15.1321 12.6512 15.1321 13.2127V21.8599H8.86761V15.8069ZM22.0753 21.8599H15.8113V16.147H21.0564C21.6179 16.147 22.0753 16.6044 22.0753 17.1659V21.8599ZM10.4032 7.53871L10.1396 9.0575C10.1288 9.11985 10.1357 9.18396 10.1594 9.24261C10.1832 9.30126 10.2228 9.35212 10.2739 9.38945C10.325 9.42678 10.3855 9.44911 10.4485 9.4539C10.5116 9.4587 10.5748 9.44578 10.6309 9.4166L12.003 8.70113L13.3678 9.41615C13.424 9.44563 13.4873 9.45876 13.5505 9.45403C13.6138 9.44931 13.6744 9.42693 13.7256 9.38943C13.7768 9.35212 13.8166 9.30121 13.8403 9.24246C13.8641 9.18372 13.8709 9.11949 13.8601 9.05705L13.5965 7.53871L14.7037 6.45735C14.7494 6.41319 14.7818 6.35706 14.7971 6.29538C14.8124 6.23369 14.81 6.16894 14.7903 6.10853C14.7706 6.04812 14.7342 5.99448 14.6854 5.95375C14.6366 5.91301 14.5774 5.88683 14.5144 5.87818L12.9902 5.65947L12.3082 4.27562C12.2801 4.2189 12.2367 4.17114 12.183 4.13771C12.1292 4.10427 12.0672 4.08648 12.0039 4.08633H12.0035C11.9402 4.08629 11.8782 4.10391 11.8245 4.13719C11.7707 4.17047 11.7273 4.2181 11.6992 4.27471L11.0104 5.65947L9.48527 5.87818C9.4224 5.88699 9.36326 5.91326 9.31458 5.95402C9.26591 5.99477 9.22965 6.04837 9.20993 6.10871C9.1902 6.16905 9.18781 6.23372 9.20303 6.29536C9.21824 6.35699 9.25045 6.41312 9.29599 6.45735L10.4032 7.53871ZM11.283 6.30656C11.3375 6.29872 11.3892 6.27777 11.4338 6.24551C11.4783 6.21325 11.5144 6.17064 11.5389 6.12135L12.0021 5.19124L12.4599 6.12045C12.4844 6.16993 12.5206 6.2127 12.5653 6.24505C12.61 6.2774 12.662 6.29836 12.7167 6.30611L13.736 6.45282L12.9938 7.17781C12.9543 7.2163 12.9248 7.26385 12.9078 7.31632C12.8909 7.36879 12.887 7.42461 12.8964 7.47894L13.073 8.49509L12.161 8.01735C12.1125 7.99178 12.0586 7.97837 12.0037 7.9783C11.9489 7.97822 11.8949 7.99147 11.8463 8.0169L10.9262 8.4969L11.1028 7.47848C11.1122 7.42423 11.1083 7.36849 11.0913 7.31609C11.0744 7.2637 11.0449 7.21623 11.0054 7.17781L10.2637 6.45282L11.283 6.30656ZM7.82021 4.44724C7.88206 4.51269 7.96738 4.5509 8.0574 4.55344C8.14742 4.55599 8.23476 4.52267 8.30021 4.46082C8.36566 4.39897 8.40387 4.31366 8.40642 4.22364C8.40896 4.13362 8.37565 4.04628 8.3138 3.98082L7.58791 3.21282C7.5251 3.15106 7.44077 3.11608 7.35269 3.11525C7.2646 3.11441 7.17963 3.14779 7.11566 3.20836C7.05169 3.26892 7.01372 3.35194 7.00974 3.43994C7.00576 3.52794 7.03609 3.61405 7.09432 3.68014L7.82021 4.44724ZM10.2655 2.90626C10.2764 2.94952 10.2957 2.99021 10.3224 3.026C10.349 3.06179 10.3824 3.09199 10.4207 3.11487C10.4981 3.16106 10.5907 3.17464 10.678 3.1526C10.7213 3.14169 10.762 3.12236 10.7978 3.09572C10.8336 3.06909 10.8638 3.03566 10.8866 2.99735C10.9095 2.95905 10.9246 2.91661 10.9311 2.87246C10.9376 2.82832 10.9353 2.78333 10.9244 2.74007L10.6649 1.71486C10.6424 1.62791 10.5865 1.55335 10.5093 1.50732C10.4322 1.4613 10.34 1.44752 10.2528 1.46898C10.1654 1.49108 10.0903 1.54701 10.0441 1.62446C9.99794 1.7019 9.98439 1.79453 10.0065 1.88196L10.2655 2.90626ZM13.3212 3.1526C13.4086 3.17455 13.5011 3.16093 13.5784 3.11475C13.6557 3.06857 13.7116 2.99358 13.7337 2.90626L13.9932 1.88196C14.0153 1.79459 14.0018 1.70202 13.9557 1.62459C13.9096 1.54715 13.8346 1.49118 13.7473 1.46898C13.66 1.44738 13.5677 1.4611 13.4905 1.50713C13.4133 1.55317 13.3573 1.62781 13.3348 1.71486L13.0753 2.74007C13.0534 2.82732 13.0669 2.91971 13.113 2.99697C13.1591 3.07422 13.234 3.13003 13.3212 3.15215V3.1526ZM15.9327 4.55365C15.9789 4.55364 16.0246 4.5442 16.067 4.5259C16.1095 4.5076 16.1477 4.48083 16.1795 4.44724L16.9053 3.68014C16.9673 3.61469 17.0007 3.5273 16.9983 3.4372C16.9958 3.3471 16.9577 3.26166 16.8922 3.19969C16.8268 3.13772 16.7394 3.10429 16.6493 3.10675C16.5592 3.10922 16.4737 3.14737 16.4118 3.21282L15.6859 3.98128C15.6404 4.02955 15.6101 4.09006 15.5987 4.15535C15.5872 4.22064 15.5951 4.28786 15.6214 4.34871C15.6477 4.40956 15.6912 4.46139 15.7466 4.49781C15.802 4.53423 15.8664 4.55364 15.9327 4.55365Z"
      stroke="#11151A"
      stroke-width="0.28"
      mask="url(#path-2-outside-1_421_1468)"
    />
  </svg>
);
